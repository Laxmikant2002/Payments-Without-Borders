import * as dotenv from 'dotenv';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { TransactionStatus, TransactionType } from '../types';
import { connectDatabase } from '../config/database';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

const createUserTransactions = async () => {
  try {
    await connectDatabase();
    logger.info('Connected to database for creating user transactions');

    const userId = '6862df9d03415d409cb2142f'; // Current logged in user ID

    // Get a few other users to create transactions with
    const otherUsers = await User.find({ _id: { $ne: userId } }).limit(3);
    
    if (otherUsers.length === 0) {
      logger.error('No other users found to create transactions with');
      return;
    }

    const user1Id = (otherUsers[0] as any)._id.toString();
    const user2Id = (otherUsers[1] as any)._id.toString();
    const user3Id = (otherUsers[2] as any)._id.toString();

    // Create transactions for the current user
    const transactions = [
      {
        senderId: userId,
        receiverId: user1Id,
        amount: 250.00,
        currency: 'USD',
        status: TransactionStatus.COMPLETED,
        type: TransactionType.P2P,
        description: 'Payment for dinner',
        fees: {
          serviceFee: 2.50,
          exchangeFee: 0,
          networkFee: 1.00,
          total: 3.50
        },
        completedAt: new Date(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        senderId: user2Id,
        receiverId: userId,
        amount: 500.00,
        currency: 'USD',
        targetCurrency: 'EUR',
        exchangeRate: 0.92,
        finalAmount: 460.00,
        status: TransactionStatus.COMPLETED,
        type: TransactionType.CROSS_BORDER,
        description: 'Freelance work payment',
        fees: {
          serviceFee: 7.50,
          exchangeFee: 12.00,
          networkFee: 2.50,
          total: 22.00
        },
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: userId,
        receiverId: user3Id,
        amount: 100.00,
        currency: 'USD',
        status: TransactionStatus.PENDING,
        type: TransactionType.P2P,
        description: 'Split bill payment',
        fees: {
          serviceFee: 1.00,
          exchangeFee: 0,
          networkFee: 0.50,
          total: 1.50
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        senderId: userId,
        receiverId: user1Id,
        amount: 750.00,
        currency: 'USD',
        targetCurrency: 'GBP',
        exchangeRate: 0.79,
        finalAmount: 592.50,
        status: TransactionStatus.PROCESSING,
        type: TransactionType.CROSS_BORDER,
        description: 'Online purchase payment',
        fees: {
          serviceFee: 11.25,
          exchangeFee: 15.50,
          networkFee: 3.75,
          total: 30.50
        },
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        senderId: user2Id,
        receiverId: userId,
        amount: 50.00,
        currency: 'USD',
        status: TransactionStatus.FAILED,
        type: TransactionType.P2P,
        description: 'Coffee money',
        fees: {
          serviceFee: 0.50,
          exchangeFee: 0,
          networkFee: 0.25,
          total: 0.75
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    // Create the transactions
    for (const transactionData of transactions) {
      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();
      logger.info(`Created transaction: ${savedTransaction._id}`);
    }

    logger.info(`Successfully created ${transactions.length} transactions for user ${userId}`);
    process.exit(0);
  } catch (error) {
    logger.error('Error creating user transactions:', error);
    process.exit(1);
  }
};

createUserTransactions();
