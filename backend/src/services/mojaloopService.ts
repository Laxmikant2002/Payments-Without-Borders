import axios from 'axios';
import { logger } from '../utils/logger';
import { MojaloopTransfer } from '../types';

export class MojaloopService {
  private baseUrl: string;
  private dfspId: string;

  constructor() {
    this.baseUrl = process.env.MOJALOOP_HUB_ENDPOINT || 'http://localhost:3001';
    this.dfspId = process.env.MOJALOOP_DFSP_ID || 'paymentswithoutborders';
  }

  async initiateTransfer(transfer: Partial<MojaloopTransfer>): Promise<any> {
    try {
      logger.info('Initiating Mojaloop transfer', { transferId: transfer.transferId });

      const response = await axios.post(
        `${this.baseUrl}/transfers`,
        transfer,
        {
          headers: {
            'Content-Type': 'application/vnd.interoperability.transfers+json;version=1.0',
            'Date': new Date().toISOString(),
            'FSPIOP-Source': this.dfspId,
            'FSPIOP-Destination': transfer.payeeFsp || 'unknown'
          }
        }
      );

      logger.info('Mojaloop transfer initiated successfully', { 
        transferId: transfer.transferId,
        status: response.status 
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to initiate Mojaloop transfer', {
        transferId: transfer.transferId,
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  async getTransferStatus(transferId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transfers/${transferId}`,
        {
          headers: {
            'Content-Type': 'application/vnd.interoperability.transfers+json;version=1.0',
            'Date': new Date().toISOString(),
            'FSPIOP-Source': this.dfspId
          }
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to get Mojaloop transfer status', {
        transferId,
        error: error.message
      });
      throw error;
    }
  }

  async fulfillTransfer(transferId: string, fulfilment: string): Promise<any> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/transfers/${transferId}`,
        { fulfilment },
        {
          headers: {
            'Content-Type': 'application/vnd.interoperability.transfers+json;version=1.0',
            'Date': new Date().toISOString(),
            'FSPIOP-Source': this.dfspId
          }
        }
      );

      logger.info('Mojaloop transfer fulfilled', { transferId });
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fulfill Mojaloop transfer', {
        transferId,
        error: error.message
      });
      throw error;
    }
  }

  async lookupParticipant(identifier: string, type: string = 'MSISDN'): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/participants/${type}/${identifier}`,
        {
          headers: {
            'Content-Type': 'application/vnd.interoperability.participants+json;version=1.0',
            'Date': new Date().toISOString(),
            'FSPIOP-Source': this.dfspId
          }
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to lookup participant', {
        identifier,
        type,
        error: error.message
      });
      throw error;
    }
  }

  async requestQuote(quoteRequest: any): Promise<any> {
    try {
      logger.info('Requesting Mojaloop quote', { quoteId: quoteRequest.quoteId });

      // Use mock data in development
      if (process.env.MOCK_EXTERNAL_SERVICES === 'true') {
        logger.info('Using mock Mojaloop quote response', { quoteId: quoteRequest.quoteId });
        return this.getMockQuoteResponse(quoteRequest);
      }

      const response = await axios.post(
        `${this.baseUrl}/quotes`,
        quoteRequest,
        {
          headers: {
            'Content-Type': 'application/vnd.interoperability.quotes+json;version=1.0',
            'Date': new Date().toISOString(),
            'FSPIOP-Source': this.dfspId,
            'FSPIOP-Destination': quoteRequest.payee.fspId
          }
        }
      );

      logger.info('Mojaloop quote received', { 
        quoteId: quoteRequest.quoteId,
        status: response.status 
      });
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to request Mojaloop quote', {
        quoteId: quoteRequest.quoteId,
        error: error.message
      });
      throw error;
    }
  }

  async executeTransfer(transferRequest: any): Promise<any> {
    try {
      logger.info('Executing Mojaloop transfer', { transferId: transferRequest.transferId });

      // Use mock data in development
      if (process.env.MOCK_EXTERNAL_SERVICES === 'true') {
        logger.info('Using mock Mojaloop transfer response', { transferId: transferRequest.transferId });
        return this.getMockTransferResponse(transferRequest);
      }

      const response = await axios.post(
        `${this.baseUrl}/transfers`,
        transferRequest,
        {
          headers: {
            'Content-Type': 'application/vnd.interoperability.transfers+json;version=1.0',
            'Date': new Date().toISOString(),
            'FSPIOP-Source': this.dfspId,
            'FSPIOP-Destination': transferRequest.payeeFsp
          }
        }
      );

      logger.info('Mojaloop transfer executed', { 
        transferId: transferRequest.transferId,
        status: response.status 
      });
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to execute Mojaloop transfer', {
        transferId: transferRequest.transferId,
        error: error.message
      });
      throw error;
    }
  }

  // Mock methods for development
  private getMockQuoteResponse(quoteRequest: any): any {
    return {
      quoteId: quoteRequest.quoteId,
      transactionId: quoteRequest.transactionId,
      transferAmount: {
        amount: quoteRequest.amount.amount,
        currency: quoteRequest.amount.currency
      },
      payeeReceiveAmount: {
        amount: (parseFloat(quoteRequest.amount.amount) * 0.95).toFixed(2), // 5% fee
        currency: quoteRequest.amount.currency
      },
      payeeFspFee: {
        amount: (parseFloat(quoteRequest.amount.amount) * 0.05).toFixed(2),
        currency: quoteRequest.amount.currency
      },
      expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      condition: 'mock-condition-hash-12345',
      ilpPacket: 'mock-ilp-packet-data'
    };
  }

  private getMockTransferResponse(transferRequest: any): any {
    return {
      transferId: transferRequest.transferId,
      transferState: 'COMMITTED',
      completedTimestamp: new Date().toISOString(),
      fulfilment: 'mock-fulfilment-hash-12345'
    };
  }
}
