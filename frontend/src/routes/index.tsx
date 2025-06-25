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
import AuthGuard from '../components/AuthGuard';

// Note: We're now using AuthGuard component instead of this legacy approach
// const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
//     const { isLoggedIn, loading } = useAuth();
//     
//     if (loading) {
//         return <div>Loading...</div>;
//     }
//     
//     if (!isLoggedIn) {
//         return <Navigate to="/login" />;
//     }
//     
//     return children;
// };

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
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
                    
                    {/* Public but conditionally rendered routes */}
                    <Route path="verify-email" element={<VerifyEmail />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;