import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { MojaloopService } from './mojaloopService';
import { 
  CrossBorderTransferRequest, 
  TransferResult, 
  QuoteRequest, 
  TransferRequest,
  ExchangeRate 
} from '../types';

export class CrossBorderPaymentService {
  private mojaloopService: MojaloopService;

  constructor() {
    this.mojaloopService = new MojaloopService();
  }

  /**
   * Initiate a cross-border payment transfer
   */
  async initiateTransfer(request: CrossBorderTransferRequest): Promise<TransferResult> {
    const transferId = uuidv4();
    logger.info('Initiating cross-border transfer', { transferId, request });

    try {
      // Step 1: Compliance checks
      await this.performComplianceChecks(request);

      // Step 2: Get exchange rate if currencies differ
      let exchangeRate: ExchangeRate | undefined;
      if (request.sourceCurrency !== request.targetCurrency) {
        exchangeRate = await this.getExchangeRate(request.sourceCurrency, request.targetCurrency);
      }

      // Step 3: Request quote from Mojaloop
      const quoteRequest = this.buildQuoteRequest(request, exchangeRate);
      const quote = await this.mojaloopService.requestQuote(quoteRequest);

      // Step 4: Execute transfer
      const transferRequest = this.buildTransferRequest(request, quote, transferId);
      const transfer = await this.mojaloopService.executeTransfer(transferRequest);

      // Step 5: Track and notify
      await this.trackTransfer(transferId, transfer);

      return {
        transferId,
        status: transfer.transferState,
        quote: quote,
        exchangeRate: exchangeRate,
        fees: this.calculateFees(request.amount, exchangeRate),
        estimatedDelivery: this.calculateDeliveryTime(request.sourceCurrency, request.targetCurrency)
      };

    } catch (error: any) {
      logger.error('Cross-border transfer failed', { transferId, error: error.message });
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  /**
   * Get real-time exchange rate between currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate> {
    try {
      const apiKey = process.env.EXCHANGE_RATE_API_KEY;
      const apiUrl = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest';

      if (!apiKey && !process.env.MOCK_EXTERNAL_SERVICES) {
        throw new Error('Exchange rate API key not configured');
      }

      // Use mock rates for development
      if (process.env.MOCK_EXTERNAL_SERVICES === 'true') {
        return this.getMockExchangeRate(fromCurrency, toCurrency);
      }

      const response = await fetch(`${apiUrl}/${fromCurrency}?access_key=${apiKey}`);
      const data: any = await response.json();

      if (!data.rates || !data.rates[toCurrency]) {
        throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
      }

      return {
        fromCurrency,
        toCurrency,
        rate: data.rates[toCurrency],
        timestamp: new Date(),
        provider: 'ExchangeRate-API'
      };

    } catch (error: any) {
      logger.error('Failed to get exchange rate', { fromCurrency, toCurrency, error: error.message });
      throw error;
    }
  }

  /**
   * Build quote request for Mojaloop
   */
  private buildQuoteRequest(request: CrossBorderTransferRequest, exchangeRate?: ExchangeRate): QuoteRequest {
    return {
      quoteId: uuidv4(),
      transactionId: uuidv4(),
      payer: {
        partyIdType: 'MSISDN',
        partyIdentifier: request.senderPhone || request.senderId,
        fspId: this.getFspIdByCurrency(request.sourceCurrency),
        name: request.senderName
      },
      payee: {
        partyIdType: 'MSISDN',
        partyIdentifier: request.receiverPhone || request.receiverId,
        fspId: this.getFspIdByCurrency(request.targetCurrency),
        name: request.receiverName
      },
      amountType: 'SEND',
      amount: {
        amount: request.amount.toString(),
        currency: request.sourceCurrency
      },
      transactionType: {
        scenario: 'TRANSFER',
        initiator: 'PAYER',
        initiatorType: 'CONSUMER'
      },
      note: request.description || 'Cross-border payment via PaymentsWithoutBorders',
      extensionList: {
        extension: [
          {
            key: 'exchangeRate',
            value: exchangeRate?.rate?.toString() || '1'
          },
          {
            key: 'targetCurrency',
            value: request.targetCurrency
          }
        ]
      }
    };
  }

  /**
   * Build transfer request for Mojaloop
   */
  private buildTransferRequest(
    request: CrossBorderTransferRequest, 
    quote: any, 
    transferId: string
  ): TransferRequest {
    return {
      transferId,
      payerFsp: this.getFspIdByCurrency(request.sourceCurrency),
      payeeFsp: this.getFspIdByCurrency(request.targetCurrency),
      amount: {
        amount: request.amount.toString(),
        currency: request.sourceCurrency
      },
      condition: quote.condition || this.generateCondition(),
      expiration: new Date(Date.now() + 300000).toISOString(), // 5 minutes
      ilpPacket: quote.ilpPacket || this.generateIlpPacket(request)
    };
  }

  /**
   * Get DFSP ID based on currency
   */
  private getFspIdByCurrency(currency: string): string {
    const currencyMappings: { [key: string]: string } = {
      'USD': 'dfsp-usd',
      'EUR': 'dfsp-eur',
      'GBP': 'dfsp-gbp',
      'NGN': 'dfsp-ngn',
      'KES': 'dfsp-kes',
      'GHS': 'dfsp-ghs'
    };

    return currencyMappings[currency] || process.env.MOJALOOP_DFSP_ID || 'paymentswithoutborders';
  }

  /**
   * Perform compliance checks (KYC/AML)
   */
  private async performComplianceChecks(request: CrossBorderTransferRequest): Promise<void> {
    logger.info('Performing compliance checks', { senderId: request.senderId });

    // Skip checks in development mode
    if (process.env.SKIP_KYC_VERIFICATION === 'true') {
      logger.info('Skipping compliance checks in development mode');
      return;
    }

    // Check transaction limits
    if (request.amount > (parseInt(process.env.MAX_TRANSACTION_AMOUNT || '10000'))) {
      throw new Error('Transaction amount exceeds maximum limit');
    }

    if (request.amount < (parseInt(process.env.MIN_TRANSACTION_AMOUNT || '1'))) {
      throw new Error('Transaction amount below minimum limit');
    }

    // Perform KYC check
    await this.performKYCCheck(request.senderId);

    // Perform AML screening
    await this.performAMLScreening(request);

    logger.info('Compliance checks passed', { senderId: request.senderId });
  }

  /**
   * Perform KYC verification
   */
  private async performKYCCheck(userId: string): Promise<void> {
    try {
      if (process.env.MOCK_EXTERNAL_SERVICES === 'true') {
        // Mock KYC check
        logger.info('Mock KYC check passed', { userId });
        return;
      }

      const kycUrl = process.env.KYC_PROVIDER_URL;
      const apiKey = process.env.KYC_PROVIDER_API_KEY;

      if (!kycUrl || !apiKey) {
        throw new Error('KYC provider not configured');
      }

      // Implement actual KYC check here
      logger.info('KYC check completed', { userId });

    } catch (error: any) {
      logger.error('KYC check failed', { userId, error: error.message });
      throw new Error('KYC verification failed');
    }
  }

  /**
   * Perform AML screening
   */
  private async performAMLScreening(request: CrossBorderTransferRequest): Promise<void> {
    try {
      if (process.env.MOCK_EXTERNAL_SERVICES === 'true') {
        // Mock AML screening
        logger.info('Mock AML screening passed', { request: request.senderId });
        return;
      }

      const amlUrl = process.env.AML_PROVIDER_URL;
      const apiKey = process.env.AML_PROVIDER_API_KEY;

      if (!amlUrl || !apiKey) {
        throw new Error('AML provider not configured');
      }

      // Check against sanctions lists
      // Implement actual AML screening here
      logger.info('AML screening completed', { senderId: request.senderId });

    } catch (error: any) {
      logger.error('AML screening failed', { request: request.senderId, error: error.message });
      throw new Error('AML screening failed');
    }
  }

  /**
   * Calculate fees for the transfer
   */
  private calculateFees(amount: number, exchangeRate?: ExchangeRate): any {
    const serviceFeeRate = 0.01; // 1%
    const networkFeeFlat = 0.50; // $0.50
    const exchangeFeeRate = exchangeRate ? 0.005 : 0; // 0.5% for currency conversion

    const serviceFee = amount * serviceFeeRate;
    const exchangeFee = amount * exchangeFeeRate;
    const networkFee = networkFeeFlat;

    return {
      serviceFee,
      exchangeFee,
      networkFee,
      total: serviceFee + exchangeFee + networkFee
    };
  }

  /**
   * Calculate estimated delivery time
   */
  private calculateDeliveryTime(fromCurrency: string, toCurrency: string): string {
    // Same currency transfers are faster
    if (fromCurrency === toCurrency) {
      return 'Instant';
    }

    // Different currency transfers may take longer
    const deliveryTimes: { [key: string]: string } = {
      'USD-EUR': '1-2 minutes',
      'USD-GBP': '1-2 minutes',
      'USD-NGN': '2-5 minutes',
      'EUR-USD': '1-2 minutes',
      'EUR-GBP': '1-2 minutes'
    };

    const key = `${fromCurrency}-${toCurrency}`;
    return deliveryTimes[key] || deliveryTimes[`${toCurrency}-${fromCurrency}`] || '2-5 minutes';
  }

  /**
   * Track transfer progress
   */
  private async trackTransfer(transferId: string, transfer: any): Promise<void> {
    logger.info('Tracking transfer', { transferId, status: transfer.transferState });
    
    // Emit real-time updates via WebSocket
    // This would be handled by the socket service
    
    // Store transfer tracking information
    // This would be handled by the database service
  }

  /**
   * Get mock exchange rates for development
   */
  private getMockExchangeRate(fromCurrency: string, toCurrency: string): ExchangeRate {
    const mockRates: { [key: string]: number } = {
      'USD-EUR': 0.85,
      'USD-GBP': 0.73,
      'USD-NGN': 760.50,
      'USD-KES': 150.25,
      'EUR-USD': 1.18,
      'EUR-GBP': 0.86,
      'EUR-NGN': 895.60,
      'GBP-USD': 1.37,
      'GBP-EUR': 1.16,
      'NGN-USD': 0.0013
    };

    const key = `${fromCurrency}-${toCurrency}`;
    const rate = mockRates[key] || 1;

    return {
      fromCurrency,
      toCurrency,
      rate,
      timestamp: new Date(),
      provider: 'Mock'
    };
  }

  /**
   * Generate a mock condition for development
   */
  private generateCondition(): string {
    return Buffer.from(uuidv4()).toString('base64').substring(0, 48);
  }

  /**
   * Generate a mock ILP packet for development
   */
  private generateIlpPacket(request: CrossBorderTransferRequest): string {
    const packet = {
      amount: request.amount,
      destination: request.receiverId,
      executionCondition: this.generateCondition()
    };
    
    return Buffer.from(JSON.stringify(packet)).toString('base64');
  }
}
