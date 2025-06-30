import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../components/Home';
import Login from '../components/Login';
import Register from '../components/Register';
import ForgotPassword from '../components/ForgotPassword';
import Dashboard from '../components/Dashboard';
import Layout from '../components/Layout';
import Profile from '../components/Profile';
import UserProfile from '../components/UserProfile';
import Security from '../components/Security';
import VerifyEmail from '../components/VerifyEmail';
import Wallet from '../components/Wallet';
import Transactions from '../components/Transactions';
import SendMoney from '../components/SendMoney';
import ReceiveMoney from '../components/ReceiveMoney';
import AuthGuard from '../components/AuthGuard';
import NotFound from '../components/NotFound';
import TransactionHistory from '../components/TransactionHistory';

// Note: We're now using AuthGuard component instead of this legacy approach

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    
                    {/* Guest routes - redirect to dashboard if already logged in */}
                    <Route path="login" element={
                        <AuthGuard requireGuest>
                            <Login />
                        </AuthGuard>
                    } />
                    <Route path="register" element={
                        <AuthGuard requireGuest>
                            <Register />
                        </AuthGuard>
                    } />
                    <Route path="forgot-password" element={
                        <AuthGuard requireGuest>
                            <ForgotPassword />
                        </AuthGuard>
                    } />
                    
                    {/* Protected routes - redirect to login if not authenticated */}
                    <Route path="dashboard" element={
                        <AuthGuard requireAuth>
                            <Dashboard />
                        </AuthGuard>
                    } />
                    <Route path="profile" element={
                        <AuthGuard requireAuth>
                            <Profile />
                        </AuthGuard>
                    } />
                    <Route path="edit-profile" element={
                        <AuthGuard requireAuth>
                            <UserProfile />
                        </AuthGuard>
                    } />
                    <Route path="security" element={
                        <AuthGuard requireAuth>
                            <Security />
                        </AuthGuard>
                    } />
                    <Route path="wallet" element={
                        <AuthGuard requireAuth>
                            <Wallet />
                        </AuthGuard>
                    } />
                    <Route path="transactions" element={
                        <AuthGuard requireAuth>
                            <Transactions />
                        </AuthGuard>
                    } />
                    <Route path="send" element={
                        <AuthGuard requireAuth>
                            <SendMoney />
                        </AuthGuard>
                    } />
                    <Route path="receive" element={
                        <AuthGuard requireAuth>
                            <ReceiveMoney />
                        </AuthGuard>
                    } />
                    
                    {/* Public but conditionally rendered routes */}
                    <Route path="verify-email" element={<VerifyEmail />} />
                    <Route path="transactions/history" element={
                        <AuthGuard requireAuth>
                            <TransactionHistory />
                        </AuthGuard>
                    } />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;