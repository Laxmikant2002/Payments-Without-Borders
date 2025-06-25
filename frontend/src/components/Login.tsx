import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from '../services/auth';
import { LoginCredentials } from '../types';
import { useAuth } from '../contexts/AuthContext';
import useForm from '../hooks/useForm';

interface LocationState {
    message?: string;
}

const Login: React.FC = () => {
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { setCurrentUser, setIsLoggedIn } = useAuth();
    
    const { values, handleChange, handleSubmit } = useForm<LoginCredentials>({
        email: '',
        password: '',
        rememberMe: false
    });

    useEffect(() => {
        // Check for registration success message or other redirects
        const state = location.state as LocationState;
        if (state?.message) {
            setSuccessMessage(state.message);
            // Clear location state to avoid showing message on refresh
            window.history.replaceState({}, document.title);
        }
        
        // Check for expired session message
        const queryParams = new URLSearchParams(location.search);
        const expired = queryParams.get('expired');
        const sessionExpired = queryParams.get('session');
        
        if (expired === 'true') {
            setError('Your session has expired. Please log in again.');
        }
        
        if (sessionExpired === 'expired') {
            setError('Your session has expired. Please log in again.');
        }
    }, [location]);

    const onSubmit = async (data: LoginCredentials) => {
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        
        try {
            // Call login API
            const response = await login(data);
            
            // Update auth context
            if (response.success && response.data?.user) {
                setCurrentUser(response.data.user);
                setIsLoggedIn(true);
                
                // Get redirect URL from query params or use dashboard as default
                const queryParams = new URLSearchParams(location.search);
                const redirectUrl = queryParams.get('redirect') || '/dashboard';
                
                // Navigate to the redirect URL
                navigate(redirectUrl);
            } else {
                setError(response.message || 'Login failed. Please check your credentials.');
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your account</p>
                
                {error && <div className="alert alert-danger">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            required
                            placeholder="name@example.com"
                            className="form-control"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="form-control"
                        />
                    </div>
                    
                    <div className="form-group form-checkbox">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            name="rememberMe"
                            checked={values.rememberMe || false}
                            onChange={handleChange}
                            className="form-checkbox-input"
                        />
                        <label htmlFor="rememberMe" className="form-checkbox-label">
                            Remember me
                        </label>
                        <Link to="/forgot-password" className="forgot-password-link">
                            Forgot password?
                        </Link>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
