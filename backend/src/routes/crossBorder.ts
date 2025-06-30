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
router.post('/transfers',
  authenticateToken,
  [
    body('receiverId').notEmpty().withMessage('Receiver ID is required'),
    body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('sourceCurrency').isLength({ min: 3, max: 3 }).withMessage('Source currency must be 3 characters'),
    body('targetCurrency').isLength({ min: 3, max: 3 }).withMessage('Target currency must be 3 characters'),
    body('receiverName').optional().isString(),
    body('receiverPhone').optional().isString(),
    body('description').optional().isString().isLength({ max: 200 })
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
        sourceCurrency: transferRequest.sourceCurrency,
        targetCurrency: transferRequest.targetCurrency
      });

      const result = await crossBorderPaymentService.initiateTransfer(transferRequest);

      // Create notification for sender
      createNotification(
        transferRequest.senderId,
        'transaction',
        'Transfer Initiated',
        `Your transfer of ${transferRequest.amount} ${transferRequest.sourceCurrency} has been initiated.`,
        { transferId: result.transferId, amount: transferRequest.amount, currency: transferRequest.sourceCurrency }
      );

      // Create notification for receiver (if they have an account)
      if (transferRequest.receiverId) {
        createNotification(
          transferRequest.receiverId,
          'transaction',
          'Incoming Transfer',
          `You have a pending transfer from ${transferRequest.senderName}.`,
          { transferId: result.transferId, amount: transferRequest.amount, currency: transferRequest.sourceCurrency }
        );
      }

      res.status(201).json({
        success: true,
        data: result,
        message: 'Cross-border transfer initiated successfully'
      });
      return;

    } catch (error: any) {
      logger.error('Cross-border transfer failed', { 
        error: error.message,
        userId: req.user?.userId 
      });

      res.status(400).json({
        success: false,
        message: error.message || 'Transfer failed',
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
