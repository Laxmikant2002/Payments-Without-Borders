import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { IWallet } from './wallet.model';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ITransaction extends Document {
  sender: mongoose.Types.ObjectId | IUser;
  recipient: mongoose.Types.ObjectId | IUser;
  sourceWallet: mongoose.Types.ObjectId | IWallet;
  destinationWallet?: mongoose.Types.ObjectId | IWallet;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema: Schema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sourceWallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    destinationWallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency: {
      type: String,
      required: true,
      enum: ['USD', 'EUR', 'GBP', 'INR'],
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(TransactionType),
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    description: {
      type: String,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a unique transaction reference when creating a new transaction
transactionSchema.pre('save', function(this: any, next) {
  if (this.isNew && !this.reference) {
    this.reference = `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }
  next();
});

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
