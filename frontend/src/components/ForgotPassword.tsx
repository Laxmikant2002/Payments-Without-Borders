import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            await axios.post('https://api.example.com/auth/forgot-password', { email });
            setMessage({
                type: 'success',
                text: 'If an account exists with this email, you will receive password reset instructions shortly.'
            });
            setEmail('');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error: any) {
            if (error.response && error.response.status === 400) {
                setMessage({
                    type: 'error',
                    text: 'Please enter a valid email address.'
                });
            } else {
                setMessage({
                    type: 'success',
                    text: 'If an account exists with this email, you will receive password reset instructions shortly.'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column'}}>
            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'2rem 0'}}>
                <motion.div 
                    variants={cardVariants} 
                    initial="hidden" 
                    animate="visible"
                    style={{
                        background:'#fff',
                        borderRadius:20,
                        boxShadow:'0 4px 24px rgba(0,0,0,0.07)',
                        padding:'2.5rem 2rem',
                        maxWidth:400,
                        width:'100%'
                    }}
                >
                    <h1 style={{fontWeight:900, fontSize:'2.2rem', color:'#007BFF', marginBottom:'0.5rem', textAlign:'center'}}>
                        Forgot Password
                    </h1>
                    <p style={{color:'#495057', textAlign:'center', marginBottom:'2rem'}}>
                        Enter your email to reset your password
                    </p>
                    
                    {message && (
                        <motion.div 
                            initial={{opacity:0, y:-10}} 
                            animate={{opacity:1, y:0}}
                            style={{
                                background: message.type === 'success' ? '#D4EDDA' : '#F8D7DA',
                                color: message.type === 'success' ? '#155724' : '#721C24',
                                padding:'1rem',
                                borderRadius:12,
                                marginBottom:'1.5rem',
                                border: message.type === 'success' ? '1px solid #C3E6CB' : '1px solid #F5C6CB'
                            }}
                        >
                            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                        </motion.div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <motion.div 
                            initial={{opacity:0, x:-20}} 
                            animate={{opacity:1, x:0}} 
                            transition={{delay:0.1}}
                            style={{marginBottom:'1.5rem'}}
                        >
                            <label htmlFor="email" style={{fontWeight:600, color:'#212529', display:'block', marginBottom:'0.5rem'}}>Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                                style={{
                                    width:'100%',
                                    padding:'0.8rem 1rem',
                                    borderRadius:12,
                                    border:'1px solid #E9ECEF',
                                    fontSize:'1rem',
                                    transition:'all 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor='#007BFF'}
                                onBlur={(e) => e.target.style.borderColor='#E9ECEF'}
                            />
                        </motion.div>
                        
                        <motion.button 
                            type="submit" 
                            initial={{opacity:0, y:20}} 
                            animate={{opacity:1, y:0}} 
                            transition={{delay:0.2}}
                            style={{
                                width:'100%',
                                background:'#007BFF',
                                color:'#fff',
                                border:'none',
                                borderRadius:12,
                                padding:'1rem 1.5rem',
                                fontWeight:700,
                                fontSize:'1.1rem',
                                marginBottom:'1.2rem',
                                cursor:'pointer',
                                transition:'all 0.2s ease'
                            }}
                            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background='#0056B3'}
                            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background='#007BFF'}
                            disabled={isLoading}
                        >
                            {isLoading ? <span>⏳ Sending...</span> : '📧 Send Reset Link'}
                        </motion.button>
                    </form>
                    
                    <motion.div 
                        initial={{opacity:0, y:20}} 
                        animate={{opacity:1, y:0}} 
                        transition={{delay:0.3}}
                        style={{marginTop:'1.5rem', textAlign:'center'}}
                    >
                        <p style={{color:'#495057'}}>
                            Remember your password?{' '}
                            <Link to="/login" style={{color:'#007BFF', fontWeight:600}}>
                                Back to login
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
