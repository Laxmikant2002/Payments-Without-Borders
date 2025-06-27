import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser } from '../services/auth';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const Profile: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const user = getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    } catch (err) {
      setError('Failed to load user profile.');
      setLoading(false);
    }
  }, [setCurrentUser]);

  if (loading) {
    return (
      <div style={{background:'#fff', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <motion.div 
          initial={{opacity:0}} 
          animate={{opacity:1}} 
          style={{textAlign:'center', color:'#495057'}}
        >
          <div style={{fontSize:'2rem', marginBottom:'1rem'}}>⏳</div>
          <div style={{fontWeight:600}}>Loading profile...</div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{background:'#fff', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <motion.div 
          initial={{opacity:0}} 
          animate={{opacity:1}} 
          style={{textAlign:'center', color:'#DC3545'}}
        >
          <div style={{fontSize:'2rem', marginBottom:'1rem'}}>⚠️</div>
          <div style={{fontWeight:600}}>{error}</div>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{background:'#fff', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <motion.div 
          initial={{opacity:0}} 
          animate={{opacity:1}} 
          style={{textAlign:'center', color:'#495057'}}
        >
          <div style={{fontSize:'2rem', marginBottom:'1rem'}}>👤</div>
          <div style={{fontWeight:600}}>No user profile found.</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{background:'#fff', minHeight:'100vh', padding:'2rem 0'}}>
      <div style={{maxWidth:800, margin:'0 auto', padding:'0 2rem'}}>
        <motion.div 
          variants={cardVariants} 
          initial="hidden" 
          animate="visible"
          style={{
            background:'#fff',
            borderRadius:20,
            boxShadow:'0 4px 24px rgba(0,0,0,0.07)',
            padding:'2.5rem 2rem',
            marginBottom:'2rem'
          }}
        >
          <h1 style={{fontWeight:900, fontSize:'2.2rem', color:'#007BFF', marginBottom:'0.5rem', textAlign:'center'}}>
            User Profile
          </h1>
          <p style={{color:'#495057', textAlign:'center', marginBottom:'2rem'}}>
            Your account information and settings
          </p>
          
          <div style={{display:'grid', gap:'1.5rem', maxWidth:500, margin:'0 auto'}}>
            <motion.div 
              initial={{opacity:0, x:-20}} 
              animate={{opacity:1, x:0}} 
              transition={{delay:0.1}}
              style={{
                background:'#F8F9FA',
                borderRadius:12,
                padding:'1.5rem',
                border:'1px solid #E9ECEF'
              }}
            >
              <div style={{fontWeight:700, color:'#212529', marginBottom:'0.5rem'}}>Name</div>
              <div style={{color:'#495057', fontSize:'1.1rem'}}>{currentUser.name}</div>
            </motion.div>
            
            <motion.div 
              initial={{opacity:0, x:-20}} 
              animate={{opacity:1, x:0}} 
              transition={{delay:0.2}}
              style={{
                background:'#F8F9FA',
                borderRadius:12,
                padding:'1.5rem',
                border:'1px solid #E9ECEF'
              }}
            >
              <div style={{fontWeight:700, color:'#212529', marginBottom:'0.5rem'}}>Email</div>
              <div style={{color:'#495057', fontSize:'1.1rem'}}>{currentUser.email}</div>
            </motion.div>
            
            {currentUser.fullName && (
              <motion.div 
                initial={{opacity:0, x:-20}} 
                animate={{opacity:1, x:0}} 
                transition={{delay:0.3}}
                style={{
                  background:'#F8F9FA',
                  borderRadius:12,
                  padding:'1.5rem',
                  border:'1px solid #E9ECEF'
                }}
              >
                <div style={{fontWeight:700, color:'#212529', marginBottom:'0.5rem'}}>Full Name</div>
                <div style={{color:'#495057', fontSize:'1.1rem'}}>{currentUser.fullName}</div>
              </motion.div>
            )}
            
            {currentUser.phoneNumber && (
              <motion.div 
                initial={{opacity:0, x:-20}} 
                animate={{opacity:1, x:0}} 
                transition={{delay:0.4}}
                style={{
                  background:'#F8F9FA',
                  borderRadius:12,
                  padding:'1.5rem',
                  border:'1px solid #E9ECEF'
                }}
              >
                <div style={{fontWeight:700, color:'#212529', marginBottom:'0.5rem'}}>Phone Number</div>
                <div style={{color:'#495057', fontSize:'1.1rem'}}>{currentUser.phoneNumber}</div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile; 