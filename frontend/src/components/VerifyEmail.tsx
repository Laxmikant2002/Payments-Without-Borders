import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmEmailVerification } from '../services/auth';

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
    <div className="verify-email-container">
      <h2>Email Verification</h2>
      
      {verifying && (
        <div className="verification-status">
          <p>Verifying your email address...</p>
          <div className="spinner"></div>
        </div>
      )}

      {!verifying && success && (
        <div className="verification-success">
          <h3>Email Successfully Verified!</h3>
          <p>Your email address has been verified. You can now access all features of the application.</p>
          <button onClick={handleRedirect} className="btn btn-primary">
            Continue to Dashboard
          </button>
        </div>
      )}

      {!verifying && error && (
        <div className="verification-error">
          <h3>Verification Failed</h3>
          <p>{error}</p>
          <button onClick={handleRedirect} className="btn btn-secondary">
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
