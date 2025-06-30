import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Transaction } from '../models/Transaction';
import { logger } from '../utils/logger';
const { query, param, validationResult } = require('express-validator');

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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {
        $or: [
          { senderId: req.user.userId },
          { receiverId: req.user.userId }
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
        userId: req.user.userId, 
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
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            status: tx.status,
            senderId: tx.senderId,
            receiverId: tx.receiverId,
            description: tx.description,
            createdAt: tx.createdAt,
            updatedAt: tx.updatedAt
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

      const transaction = await Transaction.findOne({
        _id: req.params.id,
        $or: [
          { senderId: req.user.userId },
          { receiverId: req.user.userId }
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
        userId: req.user.userId 
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

export default router;
