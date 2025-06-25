import { useEffect, useRef } from 'react';
import apiClient, { isAuthenticated } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // Refresh token 14 minutes (assuming 15 min expiry)

const TokenRefresher = () => {
  const { isLoggedIn, handleLogout } = useAuth();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const setupTokenRefresh = () => {
      // Clear any existing refresh timer
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }

      if (isLoggedIn && isAuthenticated()) {
        // Set up a new refresh timer
        refreshTimerRef.current = setInterval(async () => {
          try {
            // Call the refresh token endpoint
            const response = await apiClient.post('/auth/refresh-token');
            
            if (response.data.success && response.data.data?.token) {
              // Update the token in localStorage
              localStorage.setItem('token', response.data.data.token);
              
              // Update token expiry if provided
              if (response.data.data.expiresIn) {
                const expiryDate = new Date();
                expiryDate.setSeconds(expiryDate.getSeconds() + response.data.data.expiresIn);
                localStorage.setItem('tokenExpiry', expiryDate.toISOString());
              }
              
              console.log('Token refreshed successfully');
            }
          } catch (error: any) {
            console.error('Failed to refresh token:', error);
            // If refresh fails due to unauthorized, logout the user
            if (error.response?.status === 401) {
              handleLogout();
            }
          }
        }, TOKEN_REFRESH_INTERVAL);
      }
    };

    setupTokenRefresh();

    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [isLoggedIn, handleLogout]);

  // This component doesn't render anything
  return null;
};

export default TokenRefresher;
