import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getCurrentUser, isAuthenticated, logout } from '../services/auth';

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  handleLogout: () => void;
}

const defaultState: AuthContextType = {
  currentUser: null,
  isLoggedIn: false,
  loading: true,
  setCurrentUser: () => {},
  setIsLoggedIn: () => {},
  handleLogout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultState);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = () => {
      if (isAuthenticated()) {
        const user = getCurrentUser();
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const value = {
    currentUser,
    isLoggedIn,
    loading,
    setCurrentUser,
    setIsLoggedIn,
    handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
