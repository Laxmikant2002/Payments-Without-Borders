import axios from 'axios';

// Create an axios instance for wallet API requests
const API_BASE_URL = 'http://localhost:5000';
const walletApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
walletApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface WalletData {
  id: string;
  balance: number;
  currency: string;
  walletAddress: string;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  createdAt: string;
  reference: string;
}

export interface WalletSummary {
  totalByCurrency: Record<string, number>;
  totalBalance: number;
  walletCount: number;
  activeWallets: number;
}

export interface WalletResponse {
  success: boolean;
  message?: string;
  data?: {
    wallet?: WalletData;
    wallets?: WalletData[];
    recentTransactions?: Transaction[];
    transaction?: Transaction;
    newBalance?: number;
    summary?: WalletSummary;
  };
  error?: string;
}

// Get all user wallets
export const getUserWallets = async (): Promise<WalletResponse> => {
  try {
    const response = await walletApi.get('/wallet');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching wallets:', error);
    throw error.response?.data || { 
      success: false, 
      message: 'Failed to fetch wallets',
      error: error.message 
    };
  }
};

// Get a specific wallet by ID
export const getWalletById = async (walletId: string): Promise<WalletResponse> => {
  try {
    const response = await walletApi.get(`/wallet/${walletId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching wallet ${walletId}:`, error);
    throw error.response?.data || { 
      success: false, 
      message: 'Failed to fetch wallet details',
      error: error.message 
    };
  }
};

// Create a new wallet
export const createWallet = async (currency: string = 'USD'): Promise<WalletResponse> => {
  try {
    const response = await walletApi.post('/wallet', { currency });
    return response.data;
  } catch (error: any) {
    console.error('Error creating wallet:', error);
    throw error.response?.data || { 
      success: false, 
      message: 'Failed to create wallet',
      error: error.message 
    };
  }
};

// Deposit funds to a wallet
export const depositFunds = async (
  walletId: string, 
  amount: number, 
  description?: string
): Promise<WalletResponse> => {
  try {
    const response = await walletApi.post(`/wallet/${walletId}/deposit`, {
      amount,
      description: description || 'Deposit'
    });
    return response.data;
  } catch (error: any) {
    console.error('Error depositing funds:', error);
    throw error.response?.data || { 
      success: false, 
      message: 'Failed to deposit funds',
      error: error.message 
    };
  }
};

// Get recent transactions for all user wallets
export const getRecentTransactions = async (limit: number = 5): Promise<WalletResponse> => {
  try {
    const response = await walletApi.get(`/wallet/transactions/recent?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching recent transactions:', error);
    throw error.response?.data || { 
      success: false, 
      message: 'Failed to fetch recent transactions',
      error: error.message 
    };
  }
};

// Get wallet summary (total balance across all currencies)
export const getWalletSummary = async (): Promise<WalletResponse> => {
  try {
    const response = await walletApi.get('/wallet/summary');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching wallet summary:', error);
    throw error.response?.data || { 
      success: false, 
      message: 'Failed to fetch wallet summary',
      error: error.message 
    };
  }
};
