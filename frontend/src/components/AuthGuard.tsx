import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, redirects to login when not authenticated
  requireGuest?: boolean; // If true, redirects to dashboard when authenticated
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = false, 
  requireGuest = false 
}) => {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();
  
  // Use query params to get any messages, like session expiry
  const queryParams = new URLSearchParams(location.search);
  const expired = queryParams.get('expired');
  const sessionExpired = queryParams.get('session');

  // Handle token validation
  useEffect(() => {
    // If there's an expired token message, show it
    if (expired === 'true') {
      // You could show a toast or notification here
      console.log('Your session has expired. Please log in again.');
    }
    
    if (sessionExpired === 'expired') {
      // You could show a toast or notification here
      console.log('Your session has expired. Please log in again.');
    }
  }, [expired, sessionExpired]);

  if (loading) {
    return <div className="loading">Loading authentication state...</div>;
  }

  if (requireAuth && !isLoggedIn) {
    // User is not logged in but the route requires authentication
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireGuest && isLoggedIn) {
    // User is logged in but the route requires guest access only
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
