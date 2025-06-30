import { apiClient } from './apiClient';
import {
  Transaction,
  TransferFormData,
  CrossBorderTransferRequest,
  TransactionFilters,
  PaginatedResponse,
  ApiResponse,
  QueryParams,
  TransactionFees,
  ExchangeRate
} from '../types/index';

export class TransactionService {
  // Get paginated transactions
  async getTransactions(
    filters?: TransactionFilters,
    queryParams?: QueryParams
  ): Promise<PaginatedResponse<Transaction>> {
    try {
      const params = new URLSearchParams();
      
      if (queryParams?.page) params.append('page', queryParams.page.toString());
      if (queryParams?.limit) params.append('limit', queryParams.limit.toString());
      if (queryParams?.sortBy) params.append('sortBy', queryParams.sortBy);
      if (queryParams?.sortOrder) params.append('sortOrder', queryParams.sortOrder);
      
      if (filters?.status) {
        filters.status.forEach(status => params.append('status', status));
      }
      if (filters?.type) {
        filters.type.forEach(type => params.append('type', type));
      }
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
      if (filters?.currency) params.append('currency', filters.currency);

      const response = await apiClient.get<PaginatedResponse<Transaction>>(
        `/transactions?${params.toString()}`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }

  // Get transaction by ID
  async getTransactionById(id: string): Promise<Transaction> {
    try {
      const response = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Transaction not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }

  // Initiate domestic transfer
  async initiateDomesticTransfer(transferData: TransferFormData): Promise<Transaction> {
    try {
      const response = await apiClient.post<ApiResponse<Transaction>>(
        '/transactions/domestic',
        transferData
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Transfer initiation failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Transfer failed');
    }
  }

  // Initiate cross-border transfer
  async initiateCrossBorderTransfer(transferData: CrossBorderTransferRequest): Promise<Transaction> {
    try {
      const response = await apiClient.post<ApiResponse<Transaction>>(
        '/cross-border/transfers',
        transferData
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Cross-border transfer initiation failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cross-border transfer failed');
    }
  }

  // Cancel transaction
  async cancelTransaction(transactionId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(
        `/transactions/${transactionId}/cancel`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel transaction');
    }
  }

  // Get transaction fees estimate
  async estimateFees(
    amount: number,
    sourceCurrency: string,
    targetCurrency?: string,
    transferType: 'domestic' | 'cross_border' = 'domestic'
  ): Promise<TransactionFees> {
    try {
      const response = await apiClient.post<ApiResponse<TransactionFees>>('/transactions/estimate-fees', {
        amount,
        sourceCurrency,
        targetCurrency,
        transferType
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Fee estimation failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to estimate fees');
    }
  }

  // Get exchange rates
  async getExchangeRates(from?: string, to?: string): Promise<ExchangeRate[]> {
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const response = await apiClient.get<ApiResponse<ExchangeRate[]>>(
        `/exchange-rates?${params.toString()}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exchange rates');
    }
  }

  // Get current exchange rate
  async getCurrentExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    try {
      const response = await apiClient.get<ApiResponse<ExchangeRate>>(
        `/exchange-rates/${from}/${to}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Exchange rate not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exchange rate');
    }
  }

  // Retry failed transaction
  async retryTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await apiClient.post<ApiResponse<Transaction>>(
        `/transactions/${transactionId}/retry`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Transaction retry failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to retry transaction');
    }
  }

  // Get transaction receipt
  async getTransactionReceipt(transactionId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/transactions/${transactionId}/receipt`, {
        responseType: 'blob'
      });
      return response as unknown as Blob;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download receipt');
    }
  }

  // Get transaction statistics
  async getTransactionStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalTransactions: number;
    totalAmount: number;
    successRate: number;
    avgProcessingTime: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  }> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await apiClient.get<ApiResponse<any>>(
        `/transactions/stats?${params.toString()}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Stats fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction stats');
    }
  }

  // Search transactions
  async searchTransactions(
    query: string,
    filters?: TransactionFilters
  ): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (filters?.status) {
        filters.status.forEach(status => params.append('status', status));
      }
      if (filters?.type) {
        filters.type.forEach(type => params.append('type', type));
      }

      const response = await apiClient.get<ApiResponse<Transaction[]>>(
        `/transactions/search?${params.toString()}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Search failed');
    }
  }

  // Export transactions
  async exportTransactions(
    format: 'csv' | 'excel' | 'pdf',
    filters?: TransactionFilters
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters?.status) {
        filters.status.forEach(status => params.append('status', status));
      }

      const response = await apiClient.get(`/transactions/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response as unknown as Blob;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Export failed');
    }
  }
}

export const transactionService = new TransactionService();
