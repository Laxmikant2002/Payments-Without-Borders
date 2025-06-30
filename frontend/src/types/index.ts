// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  country: string;
  currency: string;
  role: 'user' | 'admin';
  kycStatus: KYCStatus;
  amlStatus: AMLStatus;
  isActive: boolean;
  dateOfBirth: Date;
  lastLogin?: Date;
  addresses?: Address[];
  preferences?: UserPreferences;
  kycDocuments?: {
    type: string;
    number: string;
    url: string;
    additionalInfo: string;
    submittedAt: Date;
  };
  kycRejectionReason?: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: NotificationPreferences;
  twoFactorEnabled: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  dateOfBirth: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Transaction Types
export interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  targetCurrency?: string;
  status: TransactionStatus;
  type: TransactionType;
  fees: TransactionFees;
  exchangeRate?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  metadata?: TransactionMetadata;
}

export interface TransactionFees {
  platformFee: number;
  networkFee: number;
  exchangeFee?: number;
  total: number;
  currency: string;
}

export interface TransactionMetadata {
  receiverName?: string;
  receiverPhone?: string;
  mojaloopTransferId?: string;
  externalReference?: string;
  ipAddress: string;
  userAgent: string;
}

export type TransactionStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'expired';

export type TransactionType = 
  | 'domestic' 
  | 'cross_border' 
  | 'wallet_to_wallet' 
  | 'bank_transfer';

// KYC and Compliance Types
export type KYCStatus = 
  | 'not_started' 
  | 'pending' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'expired';

export type AMLStatus = 
  | 'not_checked' 
  | 'pending' 
  | 'cleared' 
  | 'flagged' 
  | 'blocked';

export interface KYCDocument {
  id: string;
  type: DocumentType;
  documentNumber: string;
  documentUrl?: string;
  status: DocumentStatus;
  uploadedAt: Date;
  reviewedAt?: Date;
  expiryDate?: Date;
  rejectionReason?: string;
}

export type DocumentType = 
  | 'passport' 
  | 'national_id' 
  | 'driving_license' 
  | 'utility_bill' 
  | 'bank_statement';

export type DocumentStatus = 
  | 'uploaded' 
  | 'under_review' 
  | 'approved' 
  | 'rejected';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 
  | 'transaction' 
  | 'kyc' 
  | 'security' 
  | 'system' 
  | 'promotional';

// Mojaloop Types
export interface PartyLookupRequest {
  partyIdType: 'MSISDN' | 'EMAIL' | 'PERSONAL_ID' | 'ACCOUNT_ID';
  partyIdentifier: string;
  partySubIdOrType?: string;
}

export interface PartyLookupResponse {
  success: boolean;
  data: {
    partyIdInfo: {
      partyIdType: string;
      partyIdentifier: string;
      fspId: string;
    };
    name: string;
    personalInfo?: {
      complexName: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

export interface MojaloopStatus {
  connected: boolean;
  endpoint: string;
  dfspId: string;
  mode: 'mock' | 'live';
  lastHealthCheck: Date;
  capabilities: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Form Types
export interface TransferFormData {
  receiverId: string;
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  receiverName?: string;
  receiverPhone?: string;
  description?: string;
}

export interface CrossBorderTransferRequest extends TransferFormData {}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  country?: string;
  preferences?: UserPreferences;
}

// Socket Types
export interface SocketEvents {
  'join-room': (userId: string) => void;
  'leave-room': (userId: string) => void;
  'transaction-update': (transaction: Transaction) => void;
  'new-notification': (notification: Notification) => void;
  'kyc-status-update': (status: KYCStatus) => void;
  'system-alert': (alert: SystemAlert) => void;
}

export interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

// Exchange Rate Types
export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
  provider: string;
}

// Exchange Rate Types (legacy support)
export interface ExchangeRateLegacy {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
  spread?: number;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Filter and Query Types
export interface TransactionFilters {
  status?: TransactionStatus[];
  type?: TransactionType[];
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
}

export interface NotificationFilters {
  unread?: boolean;
  type?: NotificationType[];
  startDate?: Date;
  endDate?: Date;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
