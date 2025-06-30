import { apiClient } from './apiClient';
import { storageService } from './storageService';
import {
  User,
  UpdateProfileRequest,
  Address,
  UserPreferences,
  ApiResponse
} from '../types/index';

export class UserService {
  // Get user profile
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/users/profile');
      if (response.success && response.data) {
        // Update stored user data
        storageService.setUser(response.data);
        return response.data;
      }
      throw new Error('Profile not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>('/users/profile', data);
      if (response.success && response.data) {
        // Update stored user data
        storageService.setUser(response.data);
        return response.data;
      }
      throw new Error('Profile update failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<{ url: string }> {
    try {
      const response = await apiClient.uploadFile<ApiResponse<{ url: string }>>(
        '/users/profile/picture',
        file
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Profile picture upload failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload profile picture');
    }
  }

  // Delete profile picture
  async deleteProfilePicture(): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete<ApiResponse>('/users/profile/picture');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete profile picture');
    }
  }

  // Get user addresses
  async getAddresses(): Promise<Address[]> {
    try {
      const response = await apiClient.get<ApiResponse<Address[]>>('/users/addresses');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }

  // Add new address
  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    try {
      const response = await apiClient.post<ApiResponse<Address>>('/users/addresses', address);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Address creation failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add address');
    }
  }

  // Update address
  async updateAddress(addressId: string, address: Partial<Address>): Promise<Address> {
    try {
      const response = await apiClient.put<ApiResponse<Address>>(
        `/users/addresses/${addressId}`,
        address
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Address update failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update address');
    }
  }

  // Delete address
  async deleteAddress(addressId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete<ApiResponse>(`/users/addresses/${addressId}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete address');
    }
  }

  // Set default address
  async setDefaultAddress(addressId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(
        `/users/addresses/${addressId}/set-default`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to set default address');
    }
  }

  // Get user preferences
  async getPreferences(): Promise<UserPreferences> {
    try {
      const response = await apiClient.get<ApiResponse<UserPreferences>>('/users/preferences');
      if (response.success && response.data) {
        storageService.setPreferences(response.data);
        return response.data;
      }
      throw new Error('Preferences not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch preferences');
    }
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response = await apiClient.put<ApiResponse<UserPreferences>>(
        '/users/preferences',
        preferences
      );
      if (response.success && response.data) {
        storageService.setPreferences(response.data);
        return response.data;
      }
      throw new Error('Preferences update failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  }

  // Search users (for sending money)
  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await apiClient.get<ApiResponse<User[]>>(
        `/users/search?q=${encodeURIComponent(query)}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'User search failed');
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('User not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  // Deactivate account
  async deactivateAccount(password: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/users/deactivate', {
        password
      });
      if (response.success) {
        // Clear local storage after account deactivation
        storageService.clearAll();
      }
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to deactivate account');
    }
  }

  // Request account deletion
  async requestAccountDeletion(password: string, reason?: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/users/request-deletion', {
        password,
        reason
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request account deletion');
    }
  }

  // Cancel account deletion request
  async cancelAccountDeletion(): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/users/cancel-deletion');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel account deletion');
    }
  }

  // Export user data (GDPR compliance)
  async exportUserData(): Promise<Blob> {
    try {
      const response = await apiClient.get('/users/export-data', {
        responseType: 'blob'
      });
      return response as unknown as Blob;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export user data');
    }
  }

  // Get user activity log
  async getActivityLog(page: number = 1, limit: number = 20): Promise<{
    activities: Array<{
      id: string;
      action: string;
      description: string;
      ipAddress: string;
      userAgent: string;
      timestamp: Date;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/users/activity-log?page=${page}&limit=${limit}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Activity log fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity log');
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    transactionAlerts?: boolean;
    securityAlerts?: boolean;
    marketingEmails?: boolean;
  }): Promise<ApiResponse> {
    try {
      const response = await apiClient.put<ApiResponse>(
        '/users/notification-preferences',
        preferences
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update notification preferences');
    }
  }

  // Block/unblock user (for admin)
  async blockUser(userId: string, reason?: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(`/users/${userId}/block`, {
        reason
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to block user');
    }
  }

  async unblockUser(userId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(`/users/${userId}/unblock`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unblock user');
    }
  }
}

export const userService = new UserService();
