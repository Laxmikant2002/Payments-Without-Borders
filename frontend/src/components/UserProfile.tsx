import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/auth';
import { User } from '../types';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const UserProfile: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [formData, setFormData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (currentUser) {
      // Initialize form with current user data
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        fullName: currentUser.fullName || '',
        phoneNumber: currentUser.phoneNumber || '',
        address: currentUser.address || '',
      });
      // Demo: If user has avatar, set it
      if ((currentUser as any).avatar) setAvatar((currentUser as any).avatar);
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files && files[0]) {
      setAvatarFile(files[0]);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      // TODO: Upload avatarFile to backend/cloud and get URL, then include in updateProfile
      const updatedUser = await updateProfile(formData);
      setCurrentUser(updatedUser);
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{background:'#fff', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <motion.div 
          initial={{opacity:0}} 
          animate={{opacity:1}} 
          style={{textAlign:'center', color:'#495057'}}
        >
          <div style={{fontSize:'2rem', marginBottom:'1rem'}}>🔒</div>
          <div style={{fontWeight:600}}>Please log in to view your profile.</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{background:'#fff', minHeight:'100vh', padding:'2rem 0'}}>
      <div style={{maxWidth:600, margin:'0 auto', padding:'0 2rem'}}>
        <motion.div 
          variants={cardVariants} 
          initial="hidden" 
          animate="visible"
          style={{
            background:'#fff',
            borderRadius:20,
            boxShadow:'0 4px 24px rgba(0,0,0,0.07)',
            padding:'2.5rem 2rem'
          }}
        >
          <h1 style={{fontWeight:900, fontSize:'2.2rem', color:'#007BFF', marginBottom:'0.5rem', textAlign:'center'}}>
            Edit Profile
          </h1>
          <p style={{color:'#495057', textAlign:'center', marginBottom:'2rem'}}>
            Update your account information and settings
          </p>

          {/* Avatar Section */}
          <motion.div 
            initial={{opacity:0, y:20}} 
            animate={{opacity:1, y:0}} 
            transition={{delay:0.1}}
            style={{
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              marginBottom:'2rem',
              padding:'1.5rem',
              background:'#F8F9FA',
              borderRadius:16,
              border:'2px dashed #E9ECEF'
            }}
          >
            <div style={{
              width:100,
              height:100,
              borderRadius:'50%',
              background:'#007BFF',
              overflow:'hidden',
              marginBottom:'1rem',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              boxShadow:'0 4px 16px rgba(0,123,255,0.2)'
            }}>
              {avatar ? (
                <img src={avatar} alt="Avatar Preview" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              ) : (
                <span style={{color:'#fff',fontSize:'2.5rem'}}>👤</span>
              )}
            </div>
            <label htmlFor="avatar-upload" style={{
              color:'#007BFF',
              fontSize:'0.95rem',
              cursor:'pointer',
              fontWeight:600,
              padding:'0.5rem 1rem',
              borderRadius:8,
              border:'1px solid #007BFF',
              transition:'all 0.2s ease'
            }}
            onMouseOver={(e: React.MouseEvent<HTMLLabelElement>) => {
              e.currentTarget.style.background='#007BFF';
              e.currentTarget.style.color='#fff';
            }}
            onMouseOut={(e: React.MouseEvent<HTMLLabelElement>) => {
              e.currentTarget.style.background='transparent';
              e.currentTarget.style.color='#007BFF';
            }}
            >
              📷 Change Avatar
            </label>
            <input id="avatar-upload" name="avatar" type="file" accept="image/*" style={{display:'none'}} onChange={handleChange} />
          </motion.div>

          {message && (
            <motion.div 
              initial={{opacity:0, y:-10}} 
              animate={{opacity:1, y:0}}
              style={{
                background:'#D4EDDA',
                color:'#155724',
                padding:'1rem',
                borderRadius:12,
                marginBottom:'1.5rem',
                border:'1px solid #C3E6CB'
              }}
            >
              ✅ {message}
            </motion.div>
          )}
          
          {error && (
            <motion.div 
              initial={{opacity:0, y:-10}} 
              animate={{opacity:1, y:0}}
              style={{
                background:'#F8D7DA',
                color:'#721C24',
                padding:'1rem',
                borderRadius:12,
                marginBottom:'1.5rem',
                border:'1px solid #F5C6CB'
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{display:'grid', gap:'1.2rem'}}>
              <motion.div 
                initial={{opacity:0, x:-20}} 
                animate={{opacity:1, x:0}} 
                transition={{delay:0.2}}
              >
                <label htmlFor="name" style={{fontWeight:600, color:'#212529', display:'block', marginBottom:'0.5rem'}}>Username</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
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

              <motion.div 
                initial={{opacity:0, x:-20}} 
                animate={{opacity:1, x:0}} 
                transition={{delay:0.3}}
              >
                <label htmlFor="email" style={{fontWeight:600, color:'#212529', display:'block', marginBottom:'0.5rem'}}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  readOnly
                  style={{
                    width:'100%',
                    padding:'0.8rem 1rem',
                    borderRadius:12,
                    border:'1px solid #E9ECEF',
                    fontSize:'1rem',
                    background:'#F8F9FA',
                    color:'#6C757D'
                  }}
                />
                <small style={{color:'#6C757D', fontSize:'0.85rem', marginTop:'0.3rem'}}>Contact support to change your email address.</small>
              </motion.div>

              <motion.div 
                initial={{opacity:0, x:-20}} 
                animate={{opacity:1, x:0}} 
                transition={{delay:0.4}}
              >
                <label htmlFor="fullName" style={{fontWeight:600, color:'#212529', display:'block', marginBottom:'0.5rem'}}>Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName || ''}
                  onChange={handleChange}
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

              <motion.div 
                initial={{opacity:0, x:-20}} 
                animate={{opacity:1, x:0}} 
                transition={{delay:0.5}}
              >
                <label htmlFor="phoneNumber" style={{fontWeight:600, color:'#212529', display:'block', marginBottom:'0.5rem'}}>Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
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

              <motion.div 
                initial={{opacity:0, x:-20}} 
                animate={{opacity:1, x:0}} 
                transition={{delay:0.6}}
              >
                <label htmlFor="address" style={{fontWeight:600, color:'#212529', display:'block', marginBottom:'0.5rem'}}>Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
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
            </div>

            <motion.button 
              type="submit" 
              initial={{opacity:0, y:20}} 
              animate={{opacity:1, y:0}} 
              transition={{delay:0.7}}
              style={{
                width:'100%',
                background:'#007BFF',
                color:'#fff',
                border:'none',
                borderRadius:12,
                padding:'1rem 1.5rem',
                fontWeight:700,
                fontSize:'1.1rem',
                marginTop:'1.5rem',
                cursor:'pointer',
                transition:'all 0.2s ease'
              }}
              onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background='#0056B3'}
              onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background='#007BFF'}
              disabled={loading}
            >
              {loading ? <span>⏳ Saving...</span> : '💾 Update Profile'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
