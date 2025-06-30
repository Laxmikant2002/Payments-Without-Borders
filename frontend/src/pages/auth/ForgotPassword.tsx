import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail } from '@mui/icons-material';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

interface ForgotPasswordData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const watchedEmail = watch('email');

  const onSubmit = async (_data: ForgotPasswordData) => {
    setLoading(true);
    try {
      // TODO: Implement actual forgot password API call
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  if (emailSent) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Card sx={{ maxWidth: 480, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Mail sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Check Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We've sent a password reset link to <strong>{watchedEmail}</strong>
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              If you don't see the email in your inbox, please check your spam folder.
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => window.open('https://mail.google.com', '_blank')}
                fullWidth
              >
                Open Gmail
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/auth/login')}
                fullWidth
              >
                Back to Login
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Didn't receive the email?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  setEmailSent(false);
                  toast('You can try again', { icon: 'ℹ️' });
                }}
              >
                Try again
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Forgot Password?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> The forgot password feature is currently under development. 
              This is a placeholder implementation.
            </Typography>
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 3 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={loading}
                  />
                )}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 3 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Remember your password?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/auth/login')}
                >
                  Back to Login
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
