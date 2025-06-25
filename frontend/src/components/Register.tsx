import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';
import { RegisterCredentials } from '../types';
import useForm from '../hooks/useForm';

const Register: React.FC = () => {
    const [generalError, setGeneralError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const validationRules = {
        name: {
            required: true,
            minLength: 2
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        password: {
            required: true,
            minLength: 8
        },
        confirmPassword: {
            required: true,
            match: 'password'
        }
    };

    const { values, errors, handleChange, handleSubmit, getFieldError } = useForm<RegisterCredentials>({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    }, validationRules);

    const onSubmit = async (data: RegisterCredentials) => {
        setGeneralError('');
        setIsLoading(true);
        
        try {
            await register(data);
            navigate('/login', { 
                state: { 
                    message: 'Registration successful! Please log in with your new account.'
                }
            });
        } catch (err: any) {
            console.error('Registration failed:', err);
            
            // Handle API validation errors
            setGeneralError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Sign up for your account</p>
                
                {generalError && <div className="alert alert-danger">{generalError}</div>}
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            className={`form-control ${getFieldError('name') ? 'is-invalid' : ''}`}
                            placeholder="John Doe"
                        />
                        {getFieldError('name') && <div className="invalid-feedback">{getFieldError('name')}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            className={`form-control ${getFieldError('email') ? 'is-invalid' : ''}`}
                            placeholder="name@example.com"
                        />
                        {getFieldError('email') && <div className="invalid-feedback">{getFieldError('email')}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            className={`form-control ${getFieldError('password') ? 'is-invalid' : ''}`}
                            placeholder="••••••••"
                        />
                        {getFieldError('password') && <div className="invalid-feedback">{getFieldError('password')}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            className={`form-control ${getFieldError('confirmPassword') ? 'is-invalid' : ''}`}
                            placeholder="••••••••"
                        />
                        {getFieldError('confirmPassword') && (
                            <div className="invalid-feedback">{getFieldError('confirmPassword')}</div>
                        )}
                    </div>
                    
                    <div className="form-group form-checkbox">
                        <input
                            type="checkbox"
                            id="termsAgreed"
                            name="termsAgreed"
                            required
                            className="form-checkbox-input"
                        />
                        <label htmlFor="termsAgreed" className="form-checkbox-label">
                            I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and{' '}
                            <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                        </label>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
