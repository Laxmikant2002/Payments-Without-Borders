import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// In-memory notification store (in production, this would be in database)
interface Notification {
  id: string;
  userId: string;
  type: 'transaction' | 'kyc' | 'security' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: any;
}

// Simple in-memory store for demo
const notifications: Notification[] = [];

// Helper function to create notification
export const createNotification = (
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  data?: any
): void => {
  const notification: Notification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date(),
    data
  };
  
  notifications.push(notification);
  
  // Keep only last 100 notifications per user
  const userNotifications = notifications.filter(n => n.userId === userId);
  if (userNotifications.length > 100) {
    const oldestNotification = userNotifications.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    const index = notifications.findIndex(n => n.id === oldestNotification.id);
    if (index > -1) {
      notifications.splice(index, 1);
    }
  }
  
  logger.info('Notification created', { userId, type, title });
};

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Filter to only unread notifications
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [transaction, kyc, security, system]
 *         description: Filter by notification type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of notifications to return
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const unreadOnly = req.query.unread === 'true';
    const type = req.query.type as string;
    const limit = parseInt(req.query.limit as string) || 20;

    let userNotifications = notifications.filter(n => n.userId === req.user!.userId);

    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read);
    }

    if (type) {
      userNotifications = userNotifications.filter(n => n.type === type);
    }

    // Sort by most recent first
    userNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply limit
    userNotifications = userNotifications.slice(0, limit);

    const unreadCount = notifications.filter(n => n.userId === req.user!.userId && !n.read).length;

    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications: userNotifications,
        unreadCount,
        total: notifications.filter(n => n.userId === req.user!.userId).length
      }
    });

  } catch (error: any) {
    logger.error('Failed to retrieve notifications', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;
    const notification = notifications.find(n => n.id === id && n.userId === req.user!.userId);

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    notification.read = true;

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });

  } catch (error: any) {
    logger.error('Failed to mark notification as read', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const unreadCount = notifications.filter(n => 
      n.userId === req.user!.userId && !n.read
    ).length;

    res.json({
      success: true,
      message: 'Unread notification count retrieved',
      data: { 
        unreadCount 
      }
    });

  } catch (error: any) {
    logger.error('Failed to get unread notification count', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.put('/read-all', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const userNotifications = notifications.filter(n => n.userId === req.user!.userId);
    userNotifications.forEach(n => n.read = true);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { 
        markedAsRead: userNotifications.length 
      }
    });

  } catch (error: any) {
    logger.error('Failed to mark all notifications as read', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
