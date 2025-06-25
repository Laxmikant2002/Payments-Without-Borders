import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { logout } from './auth';

// Base URL for API calls
const API_BASE_URL = 'http://localhost:5000';

// Token-related constants
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

/**
 * Create a configured Axios instance for API calls
 */
export const createApiClient = (config: AxiosRequestConfig = {}): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    ...config
  });

  // Request interceptor to add authorization token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (token) {
        // Check token expiration if available
        const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
        
        if (expiry && new Date(expiry) < new Date()) {
          // Token is expired, clear auth data and redirect to login
          clearAuthData();
          window.location.href = '/login?expired=true';
          return Promise.reject(new Error('Authentication token expired'));
        }
        
        // Add token to headers
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for global error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        const { status } = error.response;
        
        // Handle authentication errors
        if (status === 401) {
          // Unauthorized - token might be invalid or expired
          clearAuthData();
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?session=expired';
          }
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Clear all authentication data from local storage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Store authentication data in local storage
 */
export const setAuthData = (token: string, user: any, expiresIn?: number): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  // Calculate token expiry if expiresIn is provided (in seconds)
  if (expiresIn) {
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
  }
};

/**
 * Get authentication token from local storage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  
  if (!token) {
    return false;
  }
  
  // Check if token is expired
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (expiry && new Date(expiry) < new Date()) {
    clearAuthData();
    return false;
  }
  
  return true;
};

// Create a default API client instance
const apiClient = createApiClient();

export default apiClient;
