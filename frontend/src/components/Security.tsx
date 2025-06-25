import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { verifyEmail, setupTwoFactorAuth, verifyTwoFactor } from '../services/auth';

const Security: React.FC = () => {
  const { currentUser } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [is2FASetupVisible, setIs2FASetupVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret2FA, setSecret2FA] = useState('');

  // Email verification
  const handleVerifyEmail = async () => {
    if (!currentUser) return;
    
    try {
      setIsVerifying(true);
      setError('');
      
      await verifyEmail(currentUser.email);
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setIsVerifying(false);
    }
  };

  // Two-factor setup
  const handleSetupTwoFactor = async () => {
    if (!currentUser) return;
    
    try {
      setIsVerifying(true);
      setError('');
      
      const response = await setupTwoFactorAuth();
      setQrCodeUrl(response.qrCodeUrl);
      setSecret2FA(response.secret);
      setIs2FASetupVisible(true);
    } catch (err: any) {
      setError(err.message || 'Failed to setup two-factor authentication');
    } finally {
      setIsVerifying(false);
    }
  };

  // Verify two-factor code
  const handleVerifyTwoFactor = async () => {
    if (!verificationCode || !secret2FA) return;
    
    try {
      setIsVerifying(true);
      setError('');
      
      await verifyTwoFactor(secret2FA, verificationCode);
      setMessage('Two-factor authentication successfully enabled!');
      setIs2FASetupVisible(false);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="security-container">
      <h2>Account Security</h2>
      
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="security-section">
        <h3>Email Verification</h3>
        <p>Verify your email address to secure your account.</p>
        <button 
          onClick={handleVerifyEmail} 
          disabled={isVerifying || !currentUser}
          className="btn btn-primary"
        >
          {isVerifying ? 'Sending...' : 'Send Verification Email'}
        </button>
      </div>
      
      <div className="security-section">
        <h3>Two-Factor Authentication</h3>
        <p>Add an extra layer of security to your account with 2FA.</p>
        
        {!is2FASetupVisible ? (
          <button 
            onClick={handleSetupTwoFactor} 
            disabled={isVerifying || !currentUser}
            className="btn btn-primary"
          >
            {isVerifying ? 'Setting up...' : 'Setup Two-Factor Auth'}
          </button>
        ) : (
          <div className="two-factor-setup">
            <p>Scan this QR code with your authenticator app:</p>
            {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" />}
            
            <div className="verification-input">
              <input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button 
                onClick={handleVerifyTwoFactor}
                disabled={isVerifying || !verificationCode}
                className="btn btn-success"
              >
                Verify
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Security;
