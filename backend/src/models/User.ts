import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser, KYCStatus, AMLStatus } from '../types';

export interface UserDocument extends Omit<IUser, 'id'>, Document {}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  country: {
    type: String,
    required: true,
    uppercase: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  kycStatus: {
    type: String,
    enum: Object.values(KYCStatus),
    default: KYCStatus.PENDING
  },
  amlStatus: {
    type: String,
    enum: Object.values(AMLStatus),
    default: AMLStatus.CLEAR
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  kycDocuments: {
    type: {
      type: String
    },
    number: String,
    url: String,
    additionalInfo: String,
    submittedAt: Date
  },
  kycRejectionReason: {
    type: String
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    twoFactorAuth: { type: Boolean, default: false }
  },
  addresses: [{
    id: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isPrimary: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  profilePicture: {
    type: String
  },
  deactivatedAt: {
    type: Date
  },
  deactivationReason: {
    type: String
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ country: 1 });
userSchema.index({ kycStatus: 1 });

export const User = mongoose.model<UserDocument>('User', userSchema);
