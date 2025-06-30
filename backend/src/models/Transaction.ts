import mongoose, { Schema, Document } from 'mongoose';
import { Transaction as ITransaction, TransactionStatus, TransactionType, TransactionFees } from '../types';

export interface TransactionDocument extends Omit<ITransaction, 'id'>, Document {}

const transactionFeesSchema = new Schema<TransactionFees>({
  serviceFee: { type: Number, required: true, default: 0 },
  exchangeFee: { type: Number, default: 0 },
  networkFee: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true }
}, { _id: false });

const transactionSchema = new Schema<TransactionDocument>({
  senderId: {
    type: String,
    required: true,
    ref: 'User'
  },
  receiverId: {
    type: String,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  targetCurrency: {
    type: String,
    uppercase: true
  },
  exchangeRate: {
    type: Number,
    min: 0
  },
  finalAmount: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.PENDING
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  fees: {
    type: transactionFeesSchema,
    required: true
  },
  mojaloopTransactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
transactionSchema.index({ senderId: 1, createdAt: -1 });
transactionSchema.index({ receiverId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ mojaloopTransactionId: 1 });
transactionSchema.index({ createdAt: -1 });

export const Transaction = mongoose.model<TransactionDocument>('Transaction', transactionSchema);
