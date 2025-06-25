import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        
        try {
            // Replace with your actual API endpoint
            await axios.post('https://api.example.com/auth/forgot-password', { email });
            
            setMessage({
                type: 'success',
                text: 'If an account exists with this email, you will receive password reset instructions shortly.'
            });
            setEmail('');
        } catch (error) {
            // We don't want to reveal if an email exists in the system or not for security reasons
            setMessage({
                type: 'success',
                text: 'If an account exists with this email, you will receive password reset instructions shortly.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Forgot Password</h1>
                <p className="auth-subtitle">Enter your email to reset your password</p>
                
                {message && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                        {message.text}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@example.com"
                            className="form-control"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>
                        Remember your password?{' '}
                        <Link to="/login" className="auth-link">
                            Back to login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
