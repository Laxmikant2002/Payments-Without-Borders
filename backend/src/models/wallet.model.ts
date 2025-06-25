import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId | IUser;
  balance: number;
  currency: string;
  isActive: boolean;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a unique wallet address when creating a new wallet
walletSchema.pre('save', function(this: any, next) {
  if (this.isNew && !this.walletAddress) {
    this.walletAddress = `WAL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);

export default Wallet;
