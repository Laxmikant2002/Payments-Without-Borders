import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from '../services/auth';
import { LoginCredentials } from '../types';
import { useAuth } from '../contexts/AuthContext';
import useForm from '../hooks/useForm';
import Footer from './Footer';
import { motion } from 'framer-motion';

interface LocationState {
    message?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

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
        
        if (expired === 'true' || sessionExpired === 'expired') {
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
    };
    return (
      <div style={{background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column'}}>
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'2rem 0'}}>
          <motion.div className="auth-card" variants={cardVariants} initial="hidden" animate="visible" style={{background:'#fff', borderRadius:20, boxShadow:'0 4px 24px rgba(0,0,0,0.07)', padding:'2.5rem 2rem', maxWidth:400, width:'100%'}}>
            <h1 className="auth-title" style={{fontWeight:900, fontSize:'2.2rem', color:'#007BFF', marginBottom:'0.5rem'}}>Welcome Back</h1>
            <p className="auth-subtitle" style={{color:'#495057', marginBottom:'2rem'}}>Sign in to your account</p>
            {error && <div className="alert alert-danger" style={{marginBottom:'1rem'}}>{error}</div>}
            {successMessage && <div className="alert alert-success" style={{marginBottom:'1rem'}}>{successMessage}</div>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group" style={{marginBottom:'1.2rem'}}>
                <label htmlFor="email" style={{fontWeight:600, color:'#212529'}}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="form-control"
                  style={{marginTop:'0.5rem'}}
                />
              </div>
              <div className="form-group" style={{marginBottom:'1.2rem'}}>
                <label htmlFor="password" style={{fontWeight:600, color:'#212529'}}>Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="form-control"
                  style={{marginTop:'0.5rem'}}
                />
              </div>
              <div className="form-group form-checkbox" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={values.rememberMe || false}
                    onChange={handleChange}
                    className="form-checkbox-input"
                  />
                  <label htmlFor="rememberMe" className="form-checkbox-label" style={{fontSize:'0.98rem',color:'#495057'}}>Remember me</label>
                </div>
                <Link to="/forgot-password" className="forgot-password-link" style={{color:'#007BFF',fontWeight:500}}>Forgot password?</Link>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                style={{width:'100%',fontWeight:700,fontSize:'1.1rem',marginBottom:'1.2rem'}}
                disabled={isLoading}
              >
                {isLoading ? <span className="loading-spinner">Signing in...</span> : 'Sign In'}
              </button>
            </form>
            
            {/* Test Bypass Button */}
            <button 
              onClick={() => {
                // Set mock user data for testing
                setCurrentUser({
                  id: 1,
                  name: 'Test User',
                  email: 'test@example.com'
                });
                setIsLoggedIn(true);
                navigate('/dashboard');
              }}
              style={{
                width:'100%',
                background:'#28A745',
                color:'#fff',
                border:'none',
                borderRadius:12,
                padding:'0.8rem 1.5rem',
                fontWeight:600,
                fontSize:'1rem',
                marginBottom:'1.2rem',
                cursor:'pointer',
                transition:'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background='#218838'}
              onMouseOut={(e) => e.currentTarget.style.background='#28A745'}
            >
              🚀 Test Bypass (Go to Dashboard)
            </button>
            
            <div className="auth-footer" style={{marginTop:'1.5rem',textAlign:'center'}}>
              <p style={{color:'#495057'}}>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link" style={{color:'#007BFF',fontWeight:600}}>
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
};

export default Login;
