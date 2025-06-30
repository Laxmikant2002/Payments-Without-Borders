import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { logger } from '../utils/logger';
import { KYCStatus, TransactionStatus } from '../types';

const router = Router();

// Middleware to check if user is admin (for demo purposes, we'll check if email contains 'admin')
const requireAdmin = (req: Request, res: Response, next: any) => {
  if (!req.user || !req.user.email.includes('admin')) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: kycStatus
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, approved, rejected]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const kycStatus = req.query.kycStatus as string;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (kycStatus) {
      filter.kycStatus = kycStatus;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    logger.info('Admin retrieved users list', { userId: req.user?.userId, filter, total });

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to retrieve users', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{userId}/kyc-approve:
 *   put:
 *     summary: Approve user KYC (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KYC approved successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.put('/users/:userId/kyc-approve', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { kycStatus: KYCStatus.APPROVED },
      { new: true, select: '-password' }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    logger.info('Admin approved user KYC', { adminId: req.user?.userId, userId });

    res.json({
      success: true,
      message: 'KYC approved successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          kycStatus: user.kycStatus
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to approve KYC', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{userId}/kyc-reject:
 *   put:
 *     summary: Reject user KYC (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC rejected successfully
 *       400:
 *         description: Rejection reason required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.put('/users/:userId/kyc-reject', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        kycStatus: KYCStatus.REJECTED,
        kycRejectionReason: reason
      },
      { new: true, select: '-password' }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    logger.info('Admin rejected user KYC', { adminId: req.user?.userId, userId, reason });

    res.json({
      success: true,
      message: 'KYC rejected successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          kycStatus: user.kycStatus
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to reject KYC', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Get all transactions (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled]
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get('/transactions', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const transactions = await Transaction.find(filter)
      .populate('senderId', 'email firstName lastName')
      .populate('receiverId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    logger.info('Admin retrieved transactions list', { userId: req.user?.userId, filter, total });

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to retrieve transactions', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get('/stats', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const usersByKycStatus = await User.aggregate([
      { $group: { _id: '$kycStatus', count: { $sum: 1 } } }
    ]);
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get transaction statistics
    const totalTransactions = await Transaction.countDocuments();
    const transactionsByStatus = await Transaction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get transaction volume (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const volumeStats = await Transaction.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: TransactionStatus.COMPLETED } },
      { 
        $group: { 
          _id: '$currency',
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$fees.total' },
          count: { $sum: 1 }
        } 
      }
    ]);

    logger.info('Admin retrieved system statistics', { userId: req.user?.userId });

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          byKycStatus: usersByKycStatus.reduce((acc: any, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        transactions: {
          total: totalTransactions,
          byStatus: transactionsByStatus.reduce((acc: any, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        volume: {
          last30Days: volumeStats
        },
        generatedAt: new Date()
      }
    });

  } catch (error: any) {
    logger.error('Failed to retrieve statistics', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
