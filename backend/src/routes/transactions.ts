import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Transaction } from '../models/Transaction';
import { logger } from '../utils/logger';
import { validateAndAuthenticate } from '../utils/validation';
const { query, param, body } = require('express-validator');

const router = Router();

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get user's transaction history
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of transactions per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *         description: Filter by transaction status
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', 
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled'])
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!validateAndAuthenticate(req, res)) {
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {
        $or: [
          { senderId: req.user!.userId },
          { receiverId: req.user!.userId }
        ]
      };

      if (status) {
        query.status = status;
      }

      // Get transactions with pagination
      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const totalTransactions = await Transaction.countDocuments(query);
      const totalPages = Math.ceil(totalTransactions / limit);

      logger.info('Transaction history retrieved', { 
        userId: req.user!.userId, 
        page, 
        limit, 
        totalTransactions 
      });

      res.json({
        success: true,
        message: 'Transaction history retrieved successfully',
        data: {
          transactions: transactions.map(tx => ({
            id: tx._id,
            senderId: tx.senderId,
            receiverId: tx.receiverId,
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            targetCurrency: tx.targetCurrency,
            exchangeRate: tx.exchangeRate,
            finalAmount: tx.finalAmount,
            status: tx.status,
            description: tx.description,
            fees: tx.fees,
            mojaloopTransactionId: tx.mojaloopTransactionId,
            createdAt: tx.createdAt,
            updatedAt: tx.updatedAt,
            completedAt: tx.completedAt
          })),
          pagination: {
            currentPage: page,
            totalPages,
            totalTransactions,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error: any) {
      logger.error('Failed to retrieve transaction history', { 
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
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction details
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id',
  authenticateToken,
  [param('id').isMongoId().withMessage('Invalid transaction ID')],
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!validateAndAuthenticate(req, res)) {
        return;
      }

      const transaction = await Transaction.findOne({
        _id: req.params.id,
        $or: [
          { senderId: req.user!.userId },
          { receiverId: req.user!.userId }
        ]
      });

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
        return;
      }

      logger.info('Transaction details retrieved', { 
        transactionId: transaction._id, 
        userId: req.user!.userId 
      });

      res.json({
        success: true,
        message: 'Transaction details retrieved successfully',
        data: {
          transaction: {
            id: transaction._id,
            type: transaction.type,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            senderId: transaction.senderId,
            receiverId: transaction.receiverId,
            description: transaction.description,
            fees: transaction.fees,
            exchangeRate: transaction.exchangeRate,
            targetCurrency: transaction.targetCurrency,
            mojaloopTransactionId: transaction.mojaloopTransactionId,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
          }
        }
      });

    } catch (error: any) {
      logger.error('Failed to retrieve transaction details', { 
        error: error.message, 
        transactionId: req.params.id,
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
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction (P2P payment)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - amount
 *               - currency
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: ID of the receiver
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Transaction amount
 *               currency:
 *                 type: string
 *                 description: Currency code (e.g., USD, EUR)
 *               description:
 *                 type: string
 *                 description: Transaction description
 *               type:
 *                 type: string
 *                 enum: [p2p, bill_payment, top_up]
 *                 default: p2p
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/',
  authenticateToken,
  [
    body('receiverId').notEmpty().withMessage('Receiver ID is required'),
    body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('description').optional().isString().isLength({ max: 200 }),
    body('type').optional().isIn(['p2p', 'bill_payment', 'top_up']).withMessage('Invalid transaction type')
  ],
  async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    
    try {
      if (!validateAndAuthenticate(req, res)) {
        return;
      }

      const { receiverId, amount, currency, description, type = 'p2p' } = req.body;
      
      // Create transaction with real-time processing
      const transaction = new Transaction({
        senderId: req.user!.userId,
        receiverId,
        amount,
        currency,
        description: description || `${type.toUpperCase()} payment`,
        type,
        status: 'completed', // Simulate instant processing for domestic transfers
        fees: amount * 0.01, // 1% fee
        finalAmount: amount,
        completedAt: new Date()
      });

      await transaction.save();
      
      const processingTime = Date.now() - startTime;

      logger.info('Real-time transaction processed', {
        transactionId: transaction._id,
        senderId: req.user!.userId,
        receiverId,
        amount,
        currency,
        processingTime: `${processingTime}ms`
      });

      // Emit real-time notification via WebSocket if available
      const app = req.app;
      if (app.get('io')) {
        const io = app.get('io');
        
        // Notify sender
        io.to(`user:${req.user!.userId}`).emit('transaction-update', {
          type: 'transaction_completed',
          transaction: {
            id: transaction._id,
            amount,
            currency,
            status: 'completed',
            processingTime: `${processingTime}ms`
          },
          timestamp: new Date().toISOString()
        });

        // Notify receiver
        io.to(`user:${receiverId}`).emit('transaction-update', {
          type: 'payment_received',
          transaction: {
            id: transaction._id,
            amount,
            currency,
            senderId: req.user!.userId,
            description
          },
          timestamp: new Date().toISOString()
        });
      }

      res.status(201).json({
        success: true,
        message: 'Transaction processed successfully',
        data: {
          id: transaction._id,
          senderId: transaction.senderId,
          receiverId: transaction.receiverId,
          amount: transaction.amount,
          currency: transaction.currency,
          finalAmount: transaction.finalAmount,
          fees: transaction.fees,
          status: transaction.status,
          type: transaction.type,
          description: transaction.description,
          processingTime: `${processingTime}ms`,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt
        }
      });

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Transaction processing failed', {
        error: error.message,
        userId: req.user?.userId,
        processingTime: `${processingTime}ms`
      });
      
      res.status(500).json({
        success: false,
        message: 'Transaction processing failed',
        processingTime: `${processingTime}ms`
      });
    }
  }
);

export default router;
