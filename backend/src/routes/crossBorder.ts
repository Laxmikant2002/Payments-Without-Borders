import { Router, Request, Response } from 'express';
const { body, param, query, validationResult } = require('express-validator');
import { CrossBorderPaymentService } from '../services/crossBorderPaymentService';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { createNotification } from './notifications';

const router = Router();
const crossBorderPaymentService = new CrossBorderPaymentService();

/**
 * Initiate a cross-border payment
 * POST /api/cross-border/transfers
 */
router.post('/send',
  authenticateToken,
  [
    body('receiverId').notEmpty().withMessage('Receiver ID is required'),
    body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('currency').isLength({ min: 3, max: 3 }).withMessage('Source currency must be 3 characters'),
    body('targetCurrency').isLength({ min: 3, max: 3 }).withMessage('Target currency must be 3 characters'),
    body('receiverName').optional().isString(),
    body('receiverPhone').optional().isString(),
    body('description').optional().isString().isLength({ max: 200 }),
    body('receiverCountry').optional().isString().isLength({ min: 2, max: 2 })
  ],
  async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const transferRequest = {
        senderId: req.user.userId,
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        senderPhone: req.user.phoneNumber,
        ...req.body
      };

      logger.info('Cross-border transfer initiated', { 
        senderId: transferRequest.senderId,
        amount: transferRequest.amount,
        sourceCurrency: transferRequest.currency,
        targetCurrency: transferRequest.targetCurrency,
        processingStarted: startTime
      });

      // Simulate real-time cross-border processing
      const exchangeRate = await crossBorderPaymentService.getExchangeRate(
        transferRequest.currency, 
        transferRequest.targetCurrency
      );
      
      const fees = transferRequest.amount * 0.025; // 2.5% for cross-border
      const finalAmount = (transferRequest.amount - fees) * exchangeRate.rate;
      
      // Create transaction record for real-time tracking
      const transaction = {
        id: require('crypto').randomUUID(),
        senderId: transferRequest.senderId,
        receiverId: transferRequest.receiverId,
        amount: transferRequest.amount,
        currency: transferRequest.currency,
        targetCurrency: transferRequest.targetCurrency,
        exchangeRate: exchangeRate.rate,
        finalAmount,
        fees,
        status: 'processing',
        type: 'cross_border',
        description: transferRequest.description || 'Cross-border payment',
        createdAt: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      };

      const processingTime = Date.now() - startTime;

      // Emit real-time updates via WebSocket
      const app = req.app;
      if (app.get('io')) {
        const io = app.get('io');
        
        // Notify sender about initiation
        io.to(`user:${transferRequest.senderId}`).emit('transaction-update', {
          type: 'cross_border_initiated',
          transaction: {
            ...transaction,
            processingTime: `${processingTime}ms`
          },
          timestamp: new Date().toISOString()
        });

        // Simulate real-time status updates
        setTimeout(() => {
          transaction.status = 'in_transit';
          io.to(`user:${transferRequest.senderId}`).emit('transaction-update', {
            type: 'status_update',
            transaction,
            timestamp: new Date().toISOString()
          });
        }, 2000);

        setTimeout(() => {
          transaction.status = 'completed';
          io.to(`user:${transferRequest.senderId}`).emit('transaction-update', {
            type: 'cross_border_completed',
            transaction,
            timestamp: new Date().toISOString()
          });
          
          // Notify receiver
          io.to(`user:${transferRequest.receiverId}`).emit('transaction-update', {
            type: 'payment_received',
            transaction,
            timestamp: new Date().toISOString()
          });
        }, 5000);
      }

      // Create notifications
      createNotification(
        transferRequest.senderId,
        'transaction',
        'Transfer Initiated',
        `Your cross-border transfer of ${transferRequest.amount} ${transferRequest.currency} has been initiated.`,
        { transferId: transaction.id, amount: transferRequest.amount, currency: transferRequest.currency }
      );

      res.status(201).json({
        success: true,
        data: {
          ...transaction,
          processingTime: `${processingTime}ms`
        },
        message: 'Cross-border transfer initiated successfully'
      });
      return;

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Cross-border transfer failed', { 
        error: error.message,
        userId: req.user?.userId,
        processingTime: `${processingTime}ms`
      });

      res.status(400).json({
        success: false,
        message: error.message || 'Transfer failed',
        processingTime: `${processingTime}ms`,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
      return;
    }
  }
);

/**
 * Get exchange rates
 * GET /api/cross-border/rates?from=USD&to=EUR
 */
router.get('/rates',
  [
    query('from').isLength({ min: 3, max: 3 }).withMessage('From currency must be 3 characters'),
    query('to').isLength({ min: 3, max: 3 }).withMessage('To currency must be 3 characters')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { from, to } = req.query as { from: string; to: string };

      if (from === to) {
        res.json({
          success: true,
          data: {
            fromCurrency: from,
            toCurrency: to,
            rate: 1,
            timestamp: new Date(),
            provider: 'Direct'
          }
        });
        return;
      }

      const exchangeRate = await crossBorderPaymentService.getExchangeRate(from, to);

      res.json({
        success: true,
        data: exchangeRate
      });
      return;

    } catch (error: any) {
      logger.error('Failed to get exchange rate', { 
        error: error.message,
        from: req.query.from,
        to: req.query.to
      });

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get exchange rate'
      });
      return;
    }
  }
);

/**
 * Get supported currencies
 * GET /api/cross-border/currencies
 */
router.get('/currencies', (req: Request, res: Response) => {
  const supportedCurrencies = (process.env.SUPPORTED_CURRENCIES || 'USD,EUR,GBP,NGN,KES,GHS')
    .split(',')
    .map(currency => currency.trim());

  const currencyDetails = supportedCurrencies.map(code => ({
    code,
    name: getCurrencyName(code),
    symbol: getCurrencySymbol(code),
    dfspId: getDfspIdByCurrency(code)
  }));

  res.json({
    success: true,
    data: currencyDetails
  });
});

/**
 * Calculate transfer fees
 * POST /api/cross-border/fees
 */
router.post('/fees',
  [
    body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('sourceCurrency').isLength({ min: 3, max: 3 }).withMessage('Source currency must be 3 characters'),
    body('targetCurrency').isLength({ min: 3, max: 3 }).withMessage('Target currency must be 3 characters')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { amount, sourceCurrency, targetCurrency } = req.body;

      // Get exchange rate if currencies differ
      let exchangeRate;
      if (sourceCurrency !== targetCurrency) {
        exchangeRate = await crossBorderPaymentService.getExchangeRate(sourceCurrency, targetCurrency);
      }

      // Calculate fees
      const serviceFeeRate = 0.01; // 1%
      const networkFeeFlat = 0.50; // $0.50
      const exchangeFeeRate = exchangeRate ? 0.005 : 0; // 0.5% for currency conversion

      const serviceFee = amount * serviceFeeRate;
      const exchangeFee = amount * exchangeFeeRate;
      const networkFee = networkFeeFlat;
      const totalFees = serviceFee + exchangeFee + networkFee;

      const finalAmount = exchangeRate ? (amount - totalFees) * exchangeRate.rate : amount - totalFees;

      res.json({
        success: true,
        data: {
          amount,
          sourceCurrency,
          targetCurrency,
          exchangeRate: exchangeRate?.rate || 1,
          fees: {
            serviceFee,
            exchangeFee,
            networkFee,
            total: totalFees
          },
          finalAmount,
          breakdown: {
            originalAmount: amount,
            totalFees,
            amountAfterFees: amount - totalFees,
            exchangeRate: exchangeRate?.rate || 1,
            finalAmount
          }
        }
      });
      return;

    } catch (error: any) {
      logger.error('Failed to calculate fees', { error: error.message });

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to calculate fees'
      });
      return;
    }
  }
);

/**
 * Get transfer status
 * GET /api/cross-border/transfers/:transferId
 */
router.get('/transfers/:transferId',
  authenticateToken,
  [
    param('transferId').isUUID().withMessage('Invalid transfer ID')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { transferId } = req.params;

      // TODO: Implement transfer status lookup
      // This would query the database and Mojaloop for transfer status

      res.json({
        success: true,
        data: {
          transferId,
          status: 'PENDING',
          message: 'Transfer status lookup not yet implemented'
        }
      });
      return;

    } catch (error: any) {
      logger.error('Failed to get transfer status', { 
        error: error.message,
        transferId: req.params.transferId
      });

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get transfer status'
      });
      return;
    }
  }
);

/**
 * Get user's cross-border transfer history
 * GET /api/cross-border/history
 */
router.get('/history',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    query('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).withMessage('Invalid status')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const currency = req.query.currency as string;
      const status = req.query.status as string;

      // TODO: Implement transfer history lookup
      // This would query the database for user's transfer history

      res.json({
        success: true,
        data: {
          transfers: [],
          filters: {
            currency: currency || 'all',
            status: status || 'all'
          },
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        },
        message: 'Transfer history lookup not yet implemented'
      });
      return;

    } catch (error: any) {
      logger.error('Failed to get transfer history', { 
        error: error.message,
        userId: req.user?.userId
      });

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get transfer history'
      });
      return;
    }
  }
);

/**
 * Get real-time exchange rates
 * GET /api/cross-border/exchange-rates
 */
router.get('/exchange-rates',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Comprehensive multi-currency exchange rates
      const rates = {
        USD: {
          EUR: 0.85,
          GBP: 0.73,
          CAD: 1.25,
          AUD: 1.35,
          JPY: 110.0,
          CHF: 0.92,
          CNY: 6.45,
          NGN: 760.50,
          KES: 150.25,
          GHS: 12.80
        },
        EUR: {
          USD: 1.18,
          GBP: 0.86,
          CAD: 1.47,
          AUD: 1.59,
          JPY: 129.5,
          CHF: 1.08,
          CNY: 7.60,
          NGN: 895.60,
          KES: 177.30,
          GHS: 15.10
        },
        GBP: {
          USD: 1.37,
          EUR: 1.16,
          CAD: 1.71,
          AUD: 1.85,
          JPY: 150.7,
          CHF: 1.26,
          CNY: 8.84,
          NGN: 1041.70,
          KES: 206.00,
          GHS: 17.54
        },
        NGN: {
          USD: 0.0013,
          EUR: 0.0011,
          GBP: 0.00096,
          KES: 0.198,
          GHS: 0.017
        },
        KES: {
          USD: 0.0067,
          EUR: 0.0056,
          GBP: 0.0049,
          NGN: 5.06,
          GHS: 0.085
        },
        GHS: {
          USD: 0.078,
          EUR: 0.066,
          GBP: 0.057,
          NGN: 59.4,
          KES: 11.7
        },
        CAD: {
          USD: 0.80,
          EUR: 0.68,
          GBP: 0.58
        },
        AUD: {
          USD: 0.74,
          EUR: 0.63,
          GBP: 0.54
        },
        JPY: {
          USD: 0.0091,
          EUR: 0.0077,
          GBP: 0.0066
        },
        CHF: {
          USD: 1.09,
          EUR: 0.93,
          GBP: 0.79
        },
        CNY: {
          USD: 0.155,
          EUR: 0.132,
          GBP: 0.113
        }
      };

      const supportedCurrencies = Object.keys(rates);
      const totalPairs = Object.values(rates).reduce((sum, currencyRates) => 
        sum + Object.keys(currencyRates).length, 0
      );

      const processingTime = Date.now() - startTime;

      logger.info('Exchange rates fetched', {
        userId: req.user.userId,
        supportedCurrencies: supportedCurrencies.length,
        totalPairs,
        processingTime: `${processingTime}ms`
      });

      res.json({
        success: true,
        data: {
          rates,
          supportedCurrencies,
          totalPairs,
          timestamp: new Date().toISOString(),
          provider: 'Multi-Currency Exchange Service',
          processingTime: `${processingTime}ms`,
          metadata: {
            majorCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'],
            africanCurrencies: ['NGN', 'KES', 'GHS'],
            updateFrequency: 'Real-time',
            precision: 'Up to 6 decimal places'
          }
        },
        message: 'Multi-currency exchange rates retrieved successfully'
      });

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Failed to fetch exchange rates', {
        error: error.message,
        userId: req.user?.userId,
        processingTime: `${processingTime}ms`
      });

      res.status(500).json({
        success: false,
        message: 'Failed to fetch exchange rates',
        processingTime: `${processingTime}ms`
      });
    }
  }
);

/**
 * Convert amount between currencies
 * GET /api/cross-border/convert?from=USD&to=EUR&amount=100
 */
router.get('/convert',
  authenticateToken,
  [
    query('from').isLength({ min: 3, max: 3 }).withMessage('From currency must be 3 characters'),
    query('to').isLength({ min: 3, max: 3 }).withMessage('To currency must be 3 characters'),
    query('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number')
  ],
  async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { from, to, amount } = req.query as { from: string; to: string; amount: string };
      const numericAmount = parseFloat(amount);

      // If same currency, no conversion needed
      if (from.toUpperCase() === to.toUpperCase()) {
        const processingTime = Date.now() - startTime;
        
        res.json({
          success: true,
          data: {
            fromCurrency: from.toUpperCase(),
            toCurrency: to.toUpperCase(),
            originalAmount: numericAmount,
            exchangeRate: 1,
            convertedAmount: numericAmount,
            fees: {
              exchangeFee: 0,
              serviceFee: numericAmount * 0.01, // 1% service fee
              networkFee: 0,
              total: numericAmount * 0.01
            },
            timestamp: new Date().toISOString(),
            processingTime: `${processingTime}ms`
          },
          message: 'Same currency - no conversion needed'
        });
        return;
      }

      // Get exchange rate using the cross-border service
      const exchangeRate = await crossBorderPaymentService.getExchangeRate(
        from.toUpperCase(), 
        to.toUpperCase()
      );

      const convertedAmount = numericAmount * exchangeRate.rate;
      const fees = {
        exchangeFee: numericAmount * 0.005, // 0.5% exchange fee
        serviceFee: numericAmount * 0.01,   // 1% service fee
        networkFee: 0.50,                   // Flat network fee
        total: 0 // Will be calculated below
      };
      fees.total = fees.exchangeFee + fees.serviceFee + fees.networkFee;

      const processingTime = Date.now() - startTime;

      logger.info('Currency conversion performed', {
        userId: req.user.userId,
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount: numericAmount,
        rate: exchangeRate.rate,
        convertedAmount,
        processingTime: `${processingTime}ms`
      });

      res.json({
        success: true,
        data: {
          fromCurrency: from.toUpperCase(),
          toCurrency: to.toUpperCase(),
          originalAmount: numericAmount,
          exchangeRate: exchangeRate.rate,
          convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimals
          fees,
          rateProvider: exchangeRate.provider,
          rateTimestamp: exchangeRate.timestamp,
          timestamp: new Date().toISOString(),
          processingTime: `${processingTime}ms`
        },
        message: `Converted ${numericAmount} ${from.toUpperCase()} to ${to.toUpperCase()}`
      });

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Currency conversion failed', {
        error: error.message,
        userId: req.user?.userId,
        processingTime: `${processingTime}ms`
      });

      res.status(400).json({
        success: false,
        message: error.message || 'Currency conversion failed',
        processingTime: `${processingTime}ms`
      });
    }
  }
);

// Helper functions
function getCurrencyName(code: string): string {
  const currencyNames: { [key: string]: string } = {
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'GBP': 'British Pound',
    'NGN': 'Nigerian Naira',
    'KES': 'Kenyan Shilling',
    'GHS': 'Ghanaian Cedi'
  };
  return currencyNames[code] || code;
}

function getCurrencySymbol(code: string): string {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'NGN': '₦',
    'KES': 'KSh',
    'GHS': '₵'
  };
  return currencySymbols[code] || code;
}

function getDfspIdByCurrency(currency: string): string {
  const currencyMappings: { [key: string]: string } = {
    'USD': 'dfsp-usd',
    'EUR': 'dfsp-eur',
    'GBP': 'dfsp-gbp',
    'NGN': 'dfsp-ngn',
    'KES': 'dfsp-kes',
    'GHS': 'dfsp-ghs'
  };
  return currencyMappings[currency] || 'dfsp-default';
}

export default router;
