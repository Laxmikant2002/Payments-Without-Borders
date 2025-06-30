import { Server } from 'socket.io';
import { logger } from '../utils/logger';

export const socketHandler = (io: Server): void => {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join user to their personal room for notifications
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user:${userId}`);
      logger.info(`User ${userId} joined personal room`);
    });

    // Handle transaction status updates
    socket.on('subscribe-transaction', (transactionId: string) => {
      socket.join(`transaction:${transactionId}`);
      logger.info(`Client subscribed to transaction: ${transactionId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};

// Helper function to emit transaction updates
export const emitTransactionUpdate = (io: Server, transactionId: string, update: any): void => {
  io.to(`transaction:${transactionId}`).emit('transaction-update', {
    transactionId,
    update,
    timestamp: new Date().toISOString()
  });
};

// Helper function to emit user notifications
export const emitUserNotification = (io: Server, userId: string, notification: any): void => {
  io.to(`user:${userId}`).emit('notification', {
    userId,
    notification,
    timestamp: new Date().toISOString()
  });
};
