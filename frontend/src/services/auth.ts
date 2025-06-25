import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types';
import apiClient, { setAuthData, clearAuthData, isAuthenticated as checkIsAuthenticated } from './apiClient';

// Enhanced error handler
const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with a status code outside 2xx
    const { status, data } = error.response;
    if (status === 400) {
      throw new Error(data.message || 'Invalid request.');
    } else if (status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    } else if (status === 403) {
      throw new Error('Forbidden. You do not have access.');
    } else if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(data.message || 'An error occurred.');
    }
  } else if (error.request) {
    // No response received
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Something else happened
    throw new Error(error.message || 'An unknown error occurred.');
  }
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    
    if (response.data.success && response.data.data) {
      const { token, user, expiresIn } = response.data.data;
      
      // Store token and user data with expiry
      setAuthData(token, user, expiresIn);
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const register = async (userData: RegisterCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    
    if (response.data.success && response.data.data) {
      const { token, user, expiresIn } = response.data.data;
      
      // Store token and user data with expiry
      if (token) {
        setAuthData(token, user, expiresIn);
      }
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint if it exists (to invalidate token on server)
    await apiClient.post('/auth/logout').catch(() => {
      // Ignore errors from logout endpoint
      console.log('Logout API call failed, proceeding with local logout');
    });
  } finally {
    // Always clear local auth data
    clearAuthData();
  }
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return checkIsAuthenticated();
};

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.put('/users/profile', userData);
    
    // Update stored user data
    if (response.data.success && response.data.data.user) {
      const currentUser = getCurrentUser();
      const updatedUser = { ...currentUser, ...response.data.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response.data.data.user;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const verifyEmail = async (email: string): Promise<void> => {
  try {
    await apiClient.post('/auth/verify-email/send', { email });
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const confirmEmailVerification = async (token: string): Promise<void> => {
  try {
    await apiClient.post('/auth/verify-email/confirm', { token });
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const setupTwoFactorAuth = async (): Promise<{qrCodeUrl: string, secret: string}> => {
  try {
    const response = await apiClient.post('/auth/2fa/setup');
    return response.data.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const verifyTwoFactor = async (secret: string, code: string): Promise<void> => {
  try {
    await apiClient.post('/auth/2fa/verify', { secret, code });
    
    // Update user in localStorage with 2FA enabled
    const user = getCurrentUser();
    if (user) {
      user.twoFactorEnabled = true;
      localStorage.setItem('user', JSON.stringify(user));
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
