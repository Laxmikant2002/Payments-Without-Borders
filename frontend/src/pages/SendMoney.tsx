import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Chip,
  Divider,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Send,
  Person,
  AttachMoney,
  Receipt,
  CheckCircle,
  Search,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const steps = ['Recipient', 'Amount', 'Review', 'Confirmation'];

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

const schema = yup.object().shape({
  recipientEmail: yup.string().email('Invalid email').required('Recipient email is required'),
  recipientName: yup.string().required('Recipient name is required'),
  amount: yup.number().positive('Amount must be positive').required('Amount is required'),
  currency: yup.string().required('Currency is required'),
  description: yup.string(),
});

interface SendMoneyFormData {
  recipientEmail: string;
  recipientName: string;
  amount: number;
  currency: string;
  description: string;
}

const SendMoney: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [exchangeRate] = useState(1.0);
  const [fees] = useState(2.50);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SendMoneyFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      recipientEmail: '',
      recipientName: '',
      amount: 0,
      currency: 'USD',
      description: '',
    },
  });

  const watchedAmount = watch('amount');
  const watchedCurrency = watch('currency');

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = (data: SendMoneyFormData) => {
    console.log('Transfer data:', data);
    handleNext();
  };

  const calculateTotal = () => {
    return (watchedAmount * exchangeRate) + fees;
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Who are you sending money to?
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="recipientEmail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Recipient Email"
                      type="email"
                      error={!!errors.recipientEmail}
                      helperText={errors.recipientEmail?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="recipientName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Recipient Name"
                      error={!!errors.recipientName}
                      helperText={errors.recipientName?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              We'll verify the recipient details before processing the transfer.
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              How much are you sending?
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Amount"
                      type="number"
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.currency}>
                      <InputLabel>Currency</InputLabel>
                      <Select {...field} label="Currency">
                        {currencies.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Description (Optional)"
                      multiline
                      rows={3}
                      placeholder="What's this transfer for?"
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Exchange Rate Info */}
            <Card sx={{ mt: 3, backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  Exchange Rate Information
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Exchange Rate:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    1 {watchedCurrency} = {exchangeRate.toFixed(4)} USD
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Transfer Fee:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ${fees.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={600}>
                    Total Amount:
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="primary">
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Transfer Details
            </Typography>
            
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {watch('recipientName')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {watch('recipientEmail')}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {watchedAmount} {watchedCurrency}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Transfer Fee
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      ${fees.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {watch('description') || 'No description provided'}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight={700}>
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Alert severity="warning" sx={{ mt: 2 }}>
              Please review all details carefully. This transfer cannot be cancelled once confirmed.
            </Alert>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.success.main,
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircle sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Transfer Initiated Successfully!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Your transfer of ${watchedAmount} {watchedCurrency} to {watch('recipientName')} has been initiated.
            </Typography>

            <Chip
              label="Transaction ID: TXN-2024-001234"
              variant="outlined"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" startIcon={<Receipt />}>
                Download Receipt
              </Button>
              <Button variant="contained" onClick={() => window.location.href = '/dashboard'}>
                Back to Dashboard
              </Button>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Send Money
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Send money quickly and securely to anyone, anywhere in the world.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>
                      <Typography variant="h6" fontWeight={600}>
                        {label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      {renderStepContent(index)}
                      
                      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                        <Button
                          disabled={activeStep === 0}
                          onClick={handleBack}
                          variant="outlined"
                        >
                          Back
                        </Button>
                        
                        {activeStep === steps.length - 1 ? null : (
                          <Button
                            variant="contained"
                            onClick={activeStep === 2 ? handleSubmit(onSubmit) : handleNext}
                            startIcon={activeStep === 2 ? <Send /> : null}
                          >
                            {activeStep === 2 ? 'Send Money' : 'Continue'}
                          </Button>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Transfer Summary
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {watchedAmount || 0} {watchedCurrency}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Exchange Rate
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {exchangeRate.toFixed(4)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Transfer Fee
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ${fees.toFixed(2)}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight={600}>
                    Total
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="primary">
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Estimated arrival:</strong> 1-2 business days
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Security Features
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    256-bit SSL encryption
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Fraud protection
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Real-time monitoring
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Regulatory compliance
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SendMoney;
