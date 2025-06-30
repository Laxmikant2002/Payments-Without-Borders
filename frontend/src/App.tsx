import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { store } from './store';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import ReceiveMoney from './pages/ReceiveMoney';
import TransactionsPage from './pages/TransactionsPage';
import ExchangeRatesPage from './pages/ExchangeRatesPage';
import CrossBorderPage from './pages/CrossBorderPage';
import ProfilePage from './pages/ProfilePage';
import KYCPage from './pages/KYCPage';
import NotificationsPage from './pages/NotificationsPage';
import SupportPage from './pages/SupportPage';
import NotFoundPage from './pages/error/NotFoundPage';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { getCurrentUser } from './store/slices/authSlice';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="send" element={<SendMoney />} />
        <Route path="receive" element={<ReceiveMoney />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="cross-border" element={<CrossBorderPage />} />
        <Route path="rates" element={<ExchangeRatesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="kyc" element={<KYCPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="admin" element={<div>Admin Dashboard - Coming Soon</div>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <CssBaseline />
      <AppRoutes />
    </Provider>
  );
};

export default App;
