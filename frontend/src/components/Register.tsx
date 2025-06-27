import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';
import { RegisterCredentials } from '../types';
import useForm from '../hooks/useForm';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

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

    const { values, handleChange, handleSubmit, getFieldError } = useForm<RegisterCredentials>({
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
            setGeneralError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <div style={{background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column'}}>
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'2rem 0'}}>
          <motion.div className="auth-card" variants={cardVariants} initial="hidden" animate="visible" style={{background:'#fff', borderRadius:20, boxShadow:'0 4px 24px rgba(0,0,0,0.07)', padding:'2.5rem 2rem', maxWidth:420, width:'100%'}}>
            <h1 className="auth-title" style={{fontWeight:900, fontSize:'2.2rem', color:'#007BFF', marginBottom:'0.5rem'}}>Create Account</h1>
            <p className="auth-subtitle" style={{color:'#495057', marginBottom:'2rem'}}>Sign up for your account</p>
            {generalError && <div className="alert alert-danger" style={{marginBottom:'1rem'}}>{generalError}</div>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group" style={{marginBottom:'1.2rem'}}>
                <label htmlFor="name" style={{fontWeight:600, color:'#212529'}}>Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  className={`form-control ${getFieldError('name') ? 'is-invalid' : ''}`}
                  placeholder="John Doe"
                  style={{marginTop:'0.5rem'}}
                />
                {getFieldError('name') && <div className="invalid-feedback">{getFieldError('name')}</div>}
              </div>
              <div className="form-group" style={{marginBottom:'1.2rem'}}>
                <label htmlFor="email" style={{fontWeight:600, color:'#212529'}}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  className={`form-control ${getFieldError('email') ? 'is-invalid' : ''}`}
                  placeholder="name@example.com"
                  style={{marginTop:'0.5rem'}}
                />
                {getFieldError('email') && <div className="invalid-feedback">{getFieldError('email')}</div>}
              </div>
              <div className="form-group" style={{marginBottom:'1.2rem'}}>
                <label htmlFor="password" style={{fontWeight:600, color:'#212529'}}>Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  className={`form-control ${getFieldError('password') ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  style={{marginTop:'0.5rem'}}
                />
                {getFieldError('password') && <div className="invalid-feedback">{getFieldError('password')}</div>}
              </div>
              <div className="form-group" style={{marginBottom:'1.2rem'}}>
                <label htmlFor="confirmPassword" style={{fontWeight:600, color:'#212529'}}>Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  className={`form-control ${getFieldError('confirmPassword') ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  style={{marginTop:'0.5rem'}}
                />
                {getFieldError('confirmPassword') && (
                  <div className="invalid-feedback">{getFieldError('confirmPassword')}</div>
                )}
              </div>
              <div className="form-group form-checkbox" style={{display:'flex',alignItems:'center',marginBottom:'1.5rem'}}>
                <input
                  type="checkbox"
                  id="termsAgreed"
                  name="termsAgreed"
                  required
                  className="form-checkbox-input"
                  style={{marginRight:'0.5rem'}}
                />
                <label htmlFor="termsAgreed" className="form-checkbox-label" style={{fontSize:'0.98rem',color:'#495057'}}>
                  I agree to the <Link to="/terms" className="terms-link" style={{color:'#007BFF'}}>Terms of Service</Link> and{' '}
                  <Link to="/privacy" className="terms-link" style={{color:'#007BFF'}}>Privacy Policy</Link>
                </label>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                style={{width:'100%',fontWeight:700,fontSize:'1.1rem',marginBottom:'1.2rem'}}
                disabled={isLoading}
              >
                {isLoading ? <span className="loading-spinner">Creating Account...</span> : 'Create Account'}
              </button>
            </form>
            <div className="auth-footer" style={{marginTop:'1.5rem',textAlign:'center'}}>
              <p style={{color:'#495057'}}>
                Already have an account?{' '}
                <Link to="/login" className="auth-link" style={{color:'#007BFF',fontWeight:600}}>
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
};

export default Register;
