import { apiClient } from './apiClient';
import {
  PartyLookupRequest,
  PartyLookupResponse,
  MojaloopStatus,
  ApiResponse
} from '../types/index';

export class MojaloopService {
  // Get Mojaloop connection status
  async getStatus(): Promise<MojaloopStatus> {
    try {
      const response = await apiClient.get<ApiResponse<MojaloopStatus>>('/mojaloop/status');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Mojaloop status fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Mojaloop status');
    }
  }

  // Perform health check
  async healthCheck(): Promise<{ connected: boolean; timestamp: Date }> {
    try {
      const response = await apiClient.get<ApiResponse<{ connected: boolean; timestamp: string }>>('/mojaloop/health');
      if (response.success && response.data) {
        return {
          connected: response.data.connected,
          timestamp: new Date(response.data.timestamp)
        };
      }
      throw new Error('Health check failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Health check failed');
    }
  }

  // Get participants
  async getParticipants(): Promise<Array<{
    participantId: string;
    name: string;
    currency: string;
    isActive: boolean;
    lastSeen?: Date;
  }>> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/mojaloop/participants');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch participants');
    }
  }

  // Lookup party information
  async lookupParty(partyData: PartyLookupRequest): Promise<PartyLookupResponse> {
    try {
      const response = await apiClient.post<PartyLookupResponse>('/mojaloop/party-lookup', partyData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Party lookup failed');
    }
  }

  // Get quote for transfer
  async getQuote(quoteData: {
    payee: {
      partyIdInfo: {
        partyIdType: string;
        partyIdentifier: string;
        fspId?: string;
      };
    };
    payer: {
      partyIdInfo: {
        partyIdType: string;
        partyIdentifier: string;
        fspId?: string;
      };
    };
    amountType: 'SEND' | 'RECEIVE';
    amount: {
      currency: string;
      amount: string;
    };
    transactionType: {
      scenario: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND';
      subScenario?: string;
      initiator: 'PAYER' | 'PAYEE';
      initiatorType: 'CONSUMER' | 'AGENT' | 'BUSINESS' | 'DEVICE';
    };
    note?: string;
  }): Promise<{
    transferAmount: {
      currency: string;
      amount: string;
    };
    payeeReceiveAmount?: {
      currency: string;
      amount: string;
    };
    payeeFspFee?: {
      currency: string;
      amount: string;
    };
    payeeFspCommission?: {
      currency: string;
      amount: string;
    };
    expiration: string;
    ilpPacket: string;
    condition: string;
  }> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/mojaloop/quotes', quoteData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Quote request failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get quote');
    }
  }

  // Initiate transfer
  async initiateTransfer(transferData: {
    transferId: string;
    payeeFsp: string;
    payerFsp: string;
    amount: {
      currency: string;
      amount: string;
    };
    ilpPacket: string;
    condition: string;
    expiration: string;
    payee: {
      partyIdInfo: {
        partyIdType: string;
        partyIdentifier: string;
        fspId?: string;
      };
      personalInfo?: {
        complexName?: {
          firstName: string;
          lastName: string;
        };
      };
    };
    payer: {
      partyIdInfo: {
        partyIdType: string;
        partyIdentifier: string;
        fspId?: string;
      };
      personalInfo?: {
        complexName?: {
          firstName: string;
          lastName: string;
        };
      };
    };
  }): Promise<{
    transferId: string;
    transferState: 'RECEIVED' | 'RESERVED' | 'COMMITTED' | 'ABORTED';
    fulfilment?: string;
    completedTimestamp?: string;
    extensionList?: Array<{
      key: string;
      value: string;
    }>;
  }> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/mojaloop/transfers', transferData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Transfer initiation failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to initiate transfer');
    }
  }

  // Get transfer status
  async getTransferStatus(transferId: string): Promise<{
    transferId: string;
    transferState: 'RECEIVED' | 'RESERVED' | 'COMMITTED' | 'ABORTED';
    fulfilment?: string;
    completedTimestamp?: string;
    extensionList?: Array<{
      key: string;
      value: string;
    }>;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/mojaloop/transfers/${transferId}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Transfer status fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get transfer status');
    }
  }

  // Get supported currencies
  async getSupportedCurrencies(): Promise<Array<{
    currency: string;
    name: string;
    symbol: string;
    decimals: number;
    isActive: boolean;
  }>> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/mojaloop/currencies');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch supported currencies');
    }
  }

  // Validate party identifier
  async validatePartyIdentifier(
    partyIdType: string,
    partyIdentifier: string
  ): Promise<{
    isValid: boolean;
    format?: string;
    example?: string;
    errors?: string[];
  }> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/mojaloop/validate-party', {
        partyIdType,
        partyIdentifier
      });
      if (response.success && response.data) {
        return response.data;
      }
      return { isValid: false };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Validation failed');
    }
  }

  // Get transaction fees estimate
  async getFeesEstimate(
    amount: string,
    currency: string,
    payeeFsp: string,
    scenario: string = 'TRANSFER'
  ): Promise<{
    payerFee: {
      currency: string;
      amount: string;
    };
    payeeFee: {
      currency: string;
      amount: string;
    };
    totalFee: {
      currency: string;
      amount: string;
    };
  }> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/mojaloop/fees-estimate', {
        amount,
        currency,
        payeeFsp,
        scenario
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Fees estimate failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get fees estimate');
    }
  }

  // Get network health
  async getNetworkHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'down';
    participants: Array<{
      participantId: string;
      status: 'online' | 'offline' | 'degraded';
      latency?: number;
      lastSeen: Date;
    }>;
    statistics: {
      totalTransactions24h: number;
      successRate: number;
      avgLatency: number;
      activeParticipants: number;
    };
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/mojaloop/network-health');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Network health fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch network health');
    }
  }

  // Admin functions

  // Update Mojaloop configuration (admin only)
  async updateConfiguration(config: {
    endpoint?: string;
    dfspId?: string;
    mode?: 'mock' | 'live';
    timeout?: number;
    retryAttempts?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await apiClient.put<ApiResponse>('/mojaloop/admin/config', config);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update configuration');
    }
  }

  // Test Mojaloop connection (admin only)
  async testConnection(): Promise<{
    success: boolean;
    latency: number;
    endpoint: string;
    timestamp: Date;
    errors?: string[];
  }> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/mojaloop/admin/test-connection');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Connection test failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to test connection');
    }
  }

  // Get Mojaloop logs (admin only)
  async getLogs(
    startDate?: Date,
    endDate?: Date,
    level?: 'error' | 'warn' | 'info' | 'debug'
  ): Promise<Array<{
    timestamp: Date;
    level: string;
    message: string;
    metadata?: Record<string, any>;
  }>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (level) params.append('level', level);

      const response = await apiClient.get<ApiResponse<any[]>>(
        `/mojaloop/admin/logs?${params.toString()}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch logs');
    }
  }

  // Get Mojaloop statistics (admin only)
  async getStatistics(startDate?: Date, endDate?: Date): Promise<{
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    totalVolume: Record<string, number>;
    successRate: number;
    avgLatency: number;
    peakTps: number;
    participantStats: Array<{
      participantId: string;
      transactions: number;
      volume: Record<string, number>;
      successRate: number;
    }>;
  }> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await apiClient.get<ApiResponse<any>>(
        `/mojaloop/admin/statistics?${params.toString()}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Statistics fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
}

export const mojaloopService = new MojaloopService();
