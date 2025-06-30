import { apiClient } from './apiClient';
import { storageService } from './storageService';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User, 
  ApiResponse 
} from '../types/index';

export class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        storageService.setToken(token);
        storageService.setUser(user);
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        storageService.setToken(token);
        storageService.setUser(user);
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storageService.clearAll();
    }
  }

  // Refresh token
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = storageService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        refreshToken,
      });

      if (response.success && response.data) {
        const { token } = response.data;
        storageService.setToken(token);
        return token;
      }

      return null;
    } catch (error: any) {
      storageService.clearAll();
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return storageService.getUser();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return storageService.isAuthenticated();
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/forgot-password', {
        email,
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset request failed');
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/reset-password', {
        token,
        password: newPassword,
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/verify-email', {
        token,
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/resend-verification');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resend verification email');
    }
  }

  // Enable two-factor authentication
  async enableTwoFactor(): Promise<ApiResponse<{ qrCode: string; secret: string }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ qrCode: string; secret: string }>>(
        '/auth/2fa/enable'
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to enable 2FA');
    }
  }

  // Verify and activate two-factor authentication
  async verifyTwoFactor(token: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/2fa/verify', {
        token,
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '2FA verification failed');
    }
  }

  // Disable two-factor authentication
  async disableTwoFactor(token: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/2fa/disable', {
        token,
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to disable 2FA');
    }
  }

  // Get user sessions
  async getSessions(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/auth/sessions');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get sessions');
    }
  }

  // Revoke session
  async revokeSession(sessionId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete<ApiResponse>(`/auth/sessions/${sessionId}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to revoke session');
    }
  }

  // Revoke all sessions except current
  async revokeAllSessions(): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/sessions/revoke-all');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to revoke sessions');
    }
  }
}

export const authService = new AuthService();
