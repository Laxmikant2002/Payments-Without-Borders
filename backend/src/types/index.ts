export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth: Date;
  country: string;
  currency: string;
  kycStatus: KYCStatus;
  amlStatus: AMLStatus;
  isActive: boolean;
  lastLogin?: Date;
  kycDocuments?: {
    type: string;
    number: string;
    url: string;
    additionalInfo: string;
    submittedAt: Date;
  };
  kycRejectionReason?: string;
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language: string;
    timezone: string;
    twoFactorAuth: boolean;
  };
  addresses?: Array<{
    id: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary: boolean;
    createdAt: Date;
  }>;
  profilePicture?: string;
  deactivatedAt?: Date;
  deactivationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  targetCurrency?: string;
  exchangeRate?: number;
  finalAmount?: number;
  status: TransactionStatus;
  type: TransactionType;
  description?: string;
  fees: TransactionFees;
  mojaloopTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TransactionFees {
  serviceFee: number;
  exchangeFee?: number;
  networkFee: number;
  total: number;
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum TransactionType {
  P2P = 'p2p',
  MERCHANT = 'merchant',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  CROSS_BORDER = 'cross_border'
}

export enum KYCStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum AMLStatus {
  CLEAR = 'clear',
  UNDER_REVIEW = 'under_review',
  FLAGGED = 'flagged',
  BLOCKED = 'blocked'
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  status: DocumentStatus;
  verificationResult?: DocumentVerificationResult;
  uploadedAt: Date;
  verifiedAt?: Date;
}

export enum DocumentType {
  PASSPORT = 'passport',
  NATIONAL_ID = 'national_id',
  DRIVERS_LICENSE = 'drivers_license',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement'
}

export enum DocumentStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export interface DocumentVerificationResult {
  isValid: boolean;
  confidence: number;
  extractedData?: any;
  rejectionReason?: string;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
  provider: string;
}

export interface ComplianceCheck {
  id: string;
  userId: string;
  type: ComplianceType;
  status: ComplianceStatus;
  result?: any;
  performedAt: Date;
}

export enum ComplianceType {
  KYC = 'kyc',
  AML = 'aml',
  SANCTIONS = 'sanctions',
  PEP = 'pep'
}

export enum ComplianceStatus {
  PASS = 'pass',
  FAIL = 'fail',
  REVIEW = 'review'
}

export interface MojaloopTransfer {
  transferId: string;
  payeeFsp: string;
  payerFsp: string;
  amount: {
    amount: string;
    currency: string;
  };
  condition: string;
  expiration: string;
  ilpPacket: string;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Cross-border payment types
export interface CrossBorderTransferRequest {
  senderId: string;
  receiverId: string;
  senderName?: string;
  receiverName?: string;
  senderPhone?: string;
  receiverPhone?: string;
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  description?: string;
  urgency?: 'normal' | 'urgent';
}

export interface TransferResult {
  transferId: string;
  status: string;
  quote?: any;
  exchangeRate?: ExchangeRate;
  fees?: TransactionFees;
  estimatedDelivery?: string;
}

export interface QuoteRequest {
  quoteId: string;
  transactionId: string;
  payer: PartyInfo;
  payee: PartyInfo;
  amountType: 'SEND' | 'RECEIVE';
  amount: MoneyAmount;
  transactionType: TransactionTypeInfo;
  note?: string;
  extensionList?: {
    extension: Array<{
      key: string;
      value: string;
    }>;
  };
}

export interface TransferRequest {
  transferId: string;
  payerFsp: string;
  payeeFsp: string;
  amount: MoneyAmount;
  condition: string;
  expiration: string;
  ilpPacket: string;
}

export interface PartyInfo {
  partyIdType: string;
  partyIdentifier: string;
  fspId: string;
  name?: string;
}

export interface MoneyAmount {
  amount: string;
  currency: string;
}

export interface TransactionTypeInfo {
  scenario: string;
  initiator: string;
  initiatorType: string;
}
