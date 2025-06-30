import * as dotenv from 'dotenv';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { TransactionStatus, TransactionType, KYCStatus, AMLStatus } from '../types';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

interface SampleUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: Date;
  country: string;
  currency: string;
  kycStatus: KYCStatus;
  amlStatus: AMLStatus;
}

interface SampleTransaction {
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  targetCurrency?: string;
  exchangeRate?: number;
  finalAmount?: number;
  status: TransactionStatus;
  type: TransactionType;
  description: string;
  fees: {
    serviceFee: number;
    exchangeFee: number;
    networkFee: number;
    total: number;
  };
  mojaloopTransactionId?: string;
  completedAt?: Date;
  createdAt: Date;
}

const sampleUsers: SampleUser[] = [
  {
    email: 'alice.smith@example.com',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'Smith',
    phoneNumber: '+1234567890',
    dateOfBirth: new Date('1990-05-15'),
    country: 'US',
    currency: 'USD',
    kycStatus: KYCStatus.APPROVED,
    amlStatus: AMLStatus.CLEAR
  },
  {
    email: 'bob.johnson@example.com',
    password: 'password123',
    firstName: 'Bob',
    lastName: 'Johnson',
    phoneNumber: '+1987654321',
    dateOfBirth: new Date('1985-08-22'),
    country: 'CA',
    currency: 'CAD',
    kycStatus: KYCStatus.APPROVED,
    amlStatus: AMLStatus.CLEAR
  },
  {
    email: 'carlos.rodriguez@example.com',
    password: 'password123',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    phoneNumber: '+521234567890',
    dateOfBirth: new Date('1992-12-03'),
    country: 'MX',
    currency: 'MXN',
    kycStatus: KYCStatus.IN_PROGRESS,
    amlStatus: AMLStatus.CLEAR
  },
  {
    email: 'diana.williams@example.com',
    password: 'password123',
    firstName: 'Diana',
    lastName: 'Williams',
    phoneNumber: '+447890123456',
    dateOfBirth: new Date('1988-03-10'),
    country: 'GB',
    currency: 'GBP',
    kycStatus: KYCStatus.APPROVED,
    amlStatus: AMLStatus.CLEAR
  },
  {
    email: 'erik.larsson@example.com',
    password: 'password123',
    firstName: 'Erik',
    lastName: 'Larsson',
    phoneNumber: '+46701234567',
    dateOfBirth: new Date('1995-07-18'),
    country: 'SE',
    currency: 'SEK',
    kycStatus: KYCStatus.PENDING,
    amlStatus: AMLStatus.CLEAR
  }
];

async function seedDatabase() {
  try {
    await connectDatabase();
    logger.info('Connected to database for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    logger.info('Cleared existing data');

    // Create users
    const createdUsers: any[] = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random login within last week
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      logger.info(`Created user: ${userData.email}`);
    }

    // Create sample transactions
    const sampleTransactions: SampleTransaction[] = [
      {
        senderId: createdUsers[0]._id.toString(),
        receiverId: createdUsers[1]._id.toString(),
        amount: 1000,
        currency: 'USD',
        targetCurrency: 'CAD',
        exchangeRate: 1.35,
        finalAmount: 1350,
        status: TransactionStatus.COMPLETED,
        type: TransactionType.CROSS_BORDER,
        description: 'Payment for services',
        fees: {
          serviceFee: 15,
          exchangeFee: 8.50,
          networkFee: 2.50,
          total: 26
        },
        mojaloopTransactionId: 'ML-TX-001',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: createdUsers[1]._id.toString(),
        receiverId: createdUsers[3]._id.toString(),
        amount: 500,
        currency: 'CAD',
        targetCurrency: 'GBP',
        exchangeRate: 0.58,
        finalAmount: 290,
        status: TransactionStatus.COMPLETED,
        type: TransactionType.CROSS_BORDER,
        description: 'Gift to friend',
        fees: {
          serviceFee: 8,
          exchangeFee: 4.25,
          networkFee: 1.50,
          total: 13.75
        },
        mojaloopTransactionId: 'ML-TX-002',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: createdUsers[3]._id.toString(),
        receiverId: createdUsers[2]._id.toString(),
        amount: 750,
        currency: 'GBP',
        targetCurrency: 'MXN',
        exchangeRate: 24.5,
        finalAmount: 18375,
        status: TransactionStatus.PROCESSING,
        type: TransactionType.CROSS_BORDER,
        description: 'Business payment',
        fees: {
          serviceFee: 12,
          exchangeFee: 6.80,
          networkFee: 2,
          total: 20.80
        },
        mojaloopTransactionId: 'ML-TX-003',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        senderId: createdUsers[0]._id.toString(),
        receiverId: createdUsers[3]._id.toString(),
        amount: 250,
        currency: 'USD',
        targetCurrency: 'GBP',
        exchangeRate: 0.79,
        finalAmount: 197.5,
        status: TransactionStatus.FAILED,
        type: TransactionType.CROSS_BORDER,
        description: 'Failed transaction - insufficient funds',
        fees: {
          serviceFee: 5,
          exchangeFee: 2.25,
          networkFee: 1,
          total: 8.25
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        senderId: createdUsers[2]._id.toString(),
        receiverId: createdUsers[4]._id.toString(),
        amount: 300,
        currency: 'MXN',
        targetCurrency: 'SEK',
        exchangeRate: 0.58,
        finalAmount: 174,
        status: TransactionStatus.PENDING,
        type: TransactionType.CROSS_BORDER,
        description: 'Pending verification',
        fees: {
          serviceFee: 6,
          exchangeFee: 3.50,
          networkFee: 1.25,
          total: 10.75
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        senderId: createdUsers[4]._id.toString(),
        receiverId: createdUsers[0]._id.toString(),
        amount: 800,
        currency: 'SEK',
        targetCurrency: 'USD',
        exchangeRate: 0.095,
        finalAmount: 76,
        status: TransactionStatus.COMPLETED,
        type: TransactionType.CROSS_BORDER,
        description: 'International transfer',
        fees: {
          serviceFee: 10,
          exchangeFee: 5.20,
          networkFee: 1.80,
          total: 17
        },
        mojaloopTransactionId: 'ML-TX-004',
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    // Create transactions
    for (const transactionData of sampleTransactions) {
      const transaction = new Transaction(transactionData);
      await transaction.save();
      logger.info(`Created transaction: ${transaction._id}`);
    }

    logger.info(`Database seeded successfully!`);
    logger.info(`Created ${createdUsers.length} users and ${sampleTransactions.length} transactions`);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
