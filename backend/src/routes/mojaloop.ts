import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { MojaloopService } from '../services/mojaloopService';
import { logger } from '../utils/logger';
const { body, param, validationResult } = require('express-validator');

const router = Router();
const mojaloopService = new MojaloopService();

/**
 * @swagger
 * /api/mojaloop/status:
 *   get:
 *     summary: Get Mojaloop integration status
 *     tags: [Mojaloop]
 *     responses:
 *       200:
 *         description: Mojaloop status retrieved successfully
 */
router.get('/status', (req: Request, res: Response) => {
  const status = {
    connected: process.env.MOCK_EXTERNAL_SERVICES === 'true' ? true : false,
    endpoint: process.env.MOJALOOP_HUB_ENDPOINT || 'http://localhost:3001',
    dfspId: process.env.MOJALOOP_DFSP_ID || 'paymentswithoutborders',
    participantId: process.env.MOJALOOP_PARTICIPANT_ID || 'payments-dfsp',
    mode: process.env.MOCK_EXTERNAL_SERVICES === 'true' ? 'mock' : 'live',
    lastHealthCheck: new Date(),
    capabilities: [
      'quotes',
      'transfers',
      'party_lookup',
      'transaction_requests'
    ]
  };

  logger.info('Mojaloop status requested', { status: status.connected, mode: status.mode });

  res.json({
    success: true,
    message: 'Mojaloop integration status',
    data: status
  });
});

/**
 * @swagger
 * /api/mojaloop/participants:
 *   get:
 *     summary: Get list of available participants
 *     tags: [Mojaloop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Participants list retrieved successfully
 */
router.get('/participants', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Mock participants data
    const participants = [
      {
        fspId: 'centralbank',
        name: 'Central Bank DFSP',
        currency: 'USD',
        isActive: true
      },
      {
        fspId: 'mobilebank',
        name: 'Mobile Bank Ltd',
        currency: 'USD',
        isActive: true
      },
      {
        fspId: 'paymentswithoutborders',
        name: 'Payments Without Borders',
        currency: 'USD',
        isActive: true
      }
    ];

    logger.info('Mojaloop participants retrieved', { userId: req.user.userId });

    res.json({
      success: true,
      message: 'Participants retrieved successfully',
      data: {
        participants,
        count: participants.length
      }
    });

  } catch (error: any) {
    logger.error('Failed to retrieve participants', { 
      error: error.message, 
      userId: req.user?.userId 
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/mojaloop/party-lookup:
 *   post:
 *     summary: Lookup party information
 *     tags: [Mojaloop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partyIdType
 *               - partyIdentifier
 *             properties:
 *               partyIdType:
 *                 type: string
 *                 enum: [MSISDN, EMAIL, PERSONAL_ID, BUSINESS, DEVICE, ACCOUNT_ID, IBAN, ALIAS]
 *               partyIdentifier:
 *                 type: string
 *               partySubIdOrType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Party information retrieved successfully
 *       404:
 *         description: Party not found
 */
router.post('/party-lookup',
  authenticateToken,
  [
    body('partyIdType').isIn(['MSISDN', 'EMAIL', 'PERSONAL_ID', 'BUSINESS', 'DEVICE', 'ACCOUNT_ID', 'IBAN', 'ALIAS']),
    body('partyIdentifier').notEmpty().withMessage('Party identifier is required'),
    body('partySubIdOrType').optional().isString()
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

      const { partyIdType, partyIdentifier, partySubIdOrType } = req.body;

      // Mock party lookup
      const mockParty = {
        partyIdInfo: {
          partyIdType,
          partyIdentifier,
          partySubIdOrType,
          fspId: 'mobilebank'
        },
        merchantClassificationCode: '4321',
        name: 'John Smith',
        personalInfo: {
          complexName: {
            firstName: 'John',
            lastName: 'Smith'
          },
          dateOfBirth: '1980-01-01'
        }
      };

      logger.info('Party lookup performed', { 
        userId: req.user.userId, 
        partyIdType, 
        partyIdentifier: partyIdentifier.substring(0, 4) + '****'
      });

      res.json({
        success: true,
        message: 'Party information retrieved successfully',
        data: {
          party: mockParty,
          lookupId: `lookup_${Date.now()}_${req.user.userId}`,
          timestamp: new Date()
        }
      });

    } catch (error: any) {
      logger.error('Party lookup failed', { 
        error: error.message, 
        userId: req.user?.userId 
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/mojaloop/quote:
 *   post:
 *     summary: Request a quote for transfer
 *     tags: [Mojaloop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payee
 *               - payer
 *               - amountType
 *               - amount
 *               - transactionType
 *             properties:
 *               payee:
 *                 type: object
 *               payer:
 *                 type: object
 *               amountType:
 *                 type: string
 *               amount:
 *                 type: object
 *               transactionType:
 *                 type: object
 *     responses:
 *       200:
 *         description: Quote retrieved successfully
 */
router.post('/quote',
  authenticateToken,
  [
    body('payee').isObject().withMessage('Payee information is required'),
    body('payer').isObject().withMessage('Payer information is required'),
    body('amountType').isIn(['SEND', 'RECEIVE']).withMessage('Amount type must be SEND or RECEIVE'),
    body('amount').isObject().withMessage('Amount information is required'),
    body('transactionType').isObject().withMessage('Transaction type is required')
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

      const quoteRequest = {
        quoteId: `quote_${Date.now()}_${req.user.userId}`,
        transactionId: `tx_${Date.now()}_${req.user.userId}`,
        ...req.body
      };

      const quote = await mojaloopService.requestQuote(quoteRequest);

      logger.info('Quote requested', { 
        userId: req.user.userId, 
        quoteId: quoteRequest.quoteId 
      });

      res.json({
        success: true,
        message: 'Quote retrieved successfully',
        data: {
          quote,
          quoteId: quoteRequest.quoteId,
          requestedAt: new Date()
        }
      });

    } catch (error: any) {
      logger.error('Quote request failed', { 
        error: error.message, 
        userId: req.user?.userId 
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/mojaloop/transfer/{transferId}:
 *   get:
 *     summary: Get transfer status
 *     tags: [Mojaloop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transferId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transfer ID
 *     responses:
 *       200:
 *         description: Transfer status retrieved successfully
 */
router.get('/transfer/:transferId',
  authenticateToken,
  [param('transferId').notEmpty().withMessage('Transfer ID is required')],
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

      const { transferId } = req.params;

      // Mock transfer status
      const transferStatus = {
        transferId,
        transferState: 'COMMITTED',
        fulfilment: 'mock-fulfilment-hash-12345',
        completedTimestamp: new Date(),
        ilpPacket: 'mock-ilp-packet-data',
        condition: 'mock-condition-hash-12345'
      };

      logger.info('Transfer status retrieved', { 
        userId: req.user.userId, 
        transferId 
      });

      res.json({
        success: true,
        message: 'Transfer status retrieved successfully',
        data: {
          transfer: transferStatus,
          retrievedAt: new Date()
        }
      });

    } catch (error: any) {
      logger.error('Transfer status retrieval failed', { 
        error: error.message, 
        transferId: req.params.transferId,
        userId: req.user?.userId 
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

export default router;
