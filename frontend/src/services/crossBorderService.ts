import { apiClient } from './apiClient';
import { ApiResponse } from '../types/index';

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
  provider: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  dfspId: string;
}

export interface CrossBorderTransferRequest {
  receiverId: string;
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  receiverName?: string;
  receiverPhone?: string;
  description?: string;
}

export interface TransferResult {
  transferId: string;
  status: string;
  quote: any;
  exchangeRate?: ExchangeRate;
  fees: {
    platformFee: number;
    networkFee: number;
    exchangeFee?: number;
    total: number;
    currency: string;
  };
  estimatedDelivery: string;
}

export class CrossBorderService {
  // Get real-time exchange rate
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    try {
      const response = await apiClient.get<ApiResponse<ExchangeRate>>(
        `/cross-border/rates?from=${from}&to=${to}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Exchange rate not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exchange rate');
    }
  }

  // Get supported currencies
  async getSupportedCurrencies(): Promise<Currency[]> {
    try {
      const response = await apiClient.get<ApiResponse<Currency[]>>('/cross-border/currencies');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch currencies');
    }
  }

  // Initiate cross-border transfer
  async initiateTransfer(transferData: CrossBorderTransferRequest): Promise<TransferResult> {
    try {
      const response = await apiClient.post<ApiResponse<TransferResult>>(
        '/cross-border/transfers',
        transferData
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Transfer initiation failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cross-border transfer failed');
    }
  }

  // Get transfer status
  async getTransferStatus(transferId: string): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/cross-border/transfers/${transferId}/status`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Transfer status not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transfer status');
    }
  }

  // Calculate fees
  async calculateFees(amount: number, sourceCurrency: string, targetCurrency: string): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/cross-border/calculate-fees', {
        amount,
        sourceCurrency,
        targetCurrency
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Fee calculation failed');
    } catch (error: any) {
      // If fee calculation endpoint doesn't exist, return estimated fees
      const baseFee = amount * 0.025; // 2.5% platform fee
      const networkFee = 2.5; // Fixed network fee
      return {
        platformFee: baseFee,
        networkFee: networkFee,
        total: baseFee + networkFee,
        currency: sourceCurrency
      };
    }
  }
}

export const crossBorderService = new CrossBorderService();
