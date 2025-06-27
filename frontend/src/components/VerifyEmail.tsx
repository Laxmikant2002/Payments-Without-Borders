import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmEmailVerification } from '../services/auth';
import Footer from './Footer';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const VerifyEmail: React.FC = () => {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    const verifyEmail = async () => {
      if (!token) {
        setError('Verification token is missing.');
        setVerifying(false);
        return;
      }

      try {
        await confirmEmailVerification(token);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Failed to verify email address.');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [location.search]);

  const handleRedirect = () => {
    navigate(success ? '/dashboard' : '/login');
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
            maxWidth:450,
            width:'100%',
            textAlign:'center'
          }}
        >
          <h1 style={{fontWeight:900, fontSize:'2.2rem', color:'#007BFF', marginBottom:'0.5rem'}}>
            Email Verification
          </h1>
          
          {verifying && (
            <motion.div 
              initial={{opacity:0, y:20}} 
              animate={{opacity:1, y:0}}
              style={{marginTop:'2rem'}}
            >
              <div style={{fontSize:'3rem', marginBottom:'1rem'}}>⏳</div>
              <p style={{color:'#495057', fontSize:'1.1rem', marginBottom:'1rem'}}>Verifying your email address...</p>
              <div style={{
                width:40,
                height:40,
                border:'3px solid #E9ECEF',
                borderTop:'3px solid #007BFF',
                borderRadius:'50%',
                animation:'spin 1s linear infinite',
                margin:'0 auto'
              }}></div>
            </motion.div>
          )}
          
          {!verifying && success && (
            <motion.div 
              initial={{opacity:0, y:20}} 
              animate={{opacity:1, y:0}}
              style={{marginTop:'2rem'}}
            >
              <div style={{fontSize:'3rem', marginBottom:'1rem', color:'#28A745'}}>✅</div>
              <h3 style={{color:'#212529', fontWeight:700, marginBottom:'1rem'}}>Email Successfully Verified!</h3>
              <p style={{color:'#495057', marginBottom:'2rem'}}>
                Your email address has been verified. You can now access all features of the application.
              </p>
              <button 
                onClick={handleRedirect}
                style={{
                  background:'#007BFF',
                  color:'#fff',
                  border:'none',
                  borderRadius:12,
                  padding:'0.8rem 1.5rem',
                  fontWeight:600,
                  fontSize:'1rem',
                  cursor:'pointer',
                  transition:'all 0.2s ease'
                }}
                onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background='#0056B3'}
                onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background='#007BFF'}
              >
                🚀 Continue to Dashboard
              </button>
            </motion.div>
          )}
          
          {!verifying && error && (
            <motion.div 
              initial={{opacity:0, y:20}} 
              animate={{opacity:1, y:0}}
              style={{marginTop:'2rem'}}
            >
              <div style={{fontSize:'3rem', marginBottom:'1rem', color:'#DC3545'}}>❌</div>
              <h3 style={{color:'#212529', fontWeight:700, marginBottom:'1rem'}}>Verification Failed</h3>
              <p style={{color:'#495057', marginBottom:'2rem'}}>{error}</p>
              <button 
                onClick={handleRedirect}
                style={{
                  background:'#6C757D',
                  color:'#fff',
                  border:'none',
                  borderRadius:12,
                  padding:'0.8rem 1.5rem',
                  fontWeight:600,
                  fontSize:'1rem',
                  cursor:'pointer',
                  transition:'all 0.2s ease'
                }}
                onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background='#5A6268'}
                onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background='#6C757D'}
              >
                🔙 Back to Login
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
