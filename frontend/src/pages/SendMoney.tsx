import React, { useState, useEffect } from 'react';
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
  IconButton,
} from '@mui/material';
import {
  Send,
  Person,
  AttachMoney,
  Receipt,
  CheckCircle,
  Search,
  Refresh,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { crossBorderService, Currency, ExchangeRate } from '../services/crossBorderService';

const steps = ['Recipient', 'Amount', 'Review', 'Confirmation'];

const schema = yup.object().shape({
  receiverId: yup.string().required('Recipient ID is required'),
  receiverName: yup.string().required('Recipient name is required'),
  receiverPhone: yup.string().optional(),
  amount: yup.number().positive('Amount must be positive').min(0.01, 'Minimum amount is 0.01').required('Amount is required'),
  sourceCurrency: yup.string().required('Source currency is required'),
  targetCurrency: yup.string().required('Target currency is required'),
  description: yup.string().optional().max(200, 'Description must be less than 200 characters'),
});

interface SendMoneyFormData {
  receiverId: string;
  receiverName: string;
  receiverPhone?: string;
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  description?: string;
}

const SendMoney: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [transferResult, setTransferResult] = useState<any>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SendMoneyFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      receiverId: '',
      receiverName: '',
      receiverPhone: '',
      amount: 0,
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
      description: '',
    },
  });

  const watchedAmount = watch('amount');
  const watchedSourceCurrency = watch('sourceCurrency');
  const watchedTargetCurrency = watch('targetCurrency');

  // Load supported currencies on component mount
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const supportedCurrencies = await crossBorderService.getSupportedCurrencies();
        setCurrencies(supportedCurrencies);
      } catch (error) {
        console.error('Failed to load currencies:', error);
        // Fallback to default currencies if API fails
        setCurrencies([
          { code: 'USD', name: 'US Dollar', symbol: '$', dfspId: 'usd-dfsp' },
          { code: 'EUR', name: 'Euro', symbol: '€', dfspId: 'eur-dfsp' },
          { code: 'GBP', name: 'British Pound', symbol: '£', dfspId: 'gbp-dfsp' },
          { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', dfspId: 'ngn-dfsp' },
          { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', dfspId: 'kes-dfsp' },
        ]);
      }
    };

    loadCurrencies();
  }, []);

  // Fetch exchange rate when currencies change
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (watchedSourceCurrency && watchedTargetCurrency && watchedSourceCurrency !== watchedTargetCurrency) {
        setExchangeLoading(true);
        try {
          const rate = await crossBorderService.getExchangeRate(watchedSourceCurrency, watchedTargetCurrency);
          setExchangeRate(rate);
        } catch (error) {
          console.error('Failed to fetch exchange rate:', error);
          toast.error('Failed to fetch exchange rate');
        }
        setExchangeLoading(false);
      } else {
        setExchangeRate(null);
      }
    };

    fetchExchangeRate();
  }, [watchedSourceCurrency, watchedTargetCurrency]);

  // Calculate fees when amount or currencies change
  useEffect(() => {
    const calculateFees = async () => {
      if (watchedAmount > 0 && watchedSourceCurrency && watchedTargetCurrency) {
        try {
          const calculatedFees = await crossBorderService.calculateFees(
            watchedAmount,
            watchedSourceCurrency,
            watchedTargetCurrency
          );
          setFees(calculatedFees);
        } catch (error) {
          console.error('Failed to calculate fees:', error);
        }
      }
    };

    const debounceTimer = setTimeout(calculateFees, 500);
    return () => clearTimeout(debounceTimer);
  }, [watchedAmount, watchedSourceCurrency, watchedTargetCurrency]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = async (data: SendMoneyFormData) => {
    if (activeStep === steps.length - 2) {
      // Final step - submit the transfer
      setLoading(true);
      try {
        const result = await crossBorderService.initiateTransfer(data);
        setTransferResult(result);
        toast.success('Transfer initiated successfully!');
        handleNext();
      } catch (error: any) {
        toast.error(error.message || 'Transfer failed');
      }
      setLoading(false);
    } else {
      // Move to next step
      handleNext();
    }
  };

  const refreshExchangeRate = async () => {
    if (watchedSourceCurrency && watchedTargetCurrency && watchedSourceCurrency !== watchedTargetCurrency) {
      setExchangeLoading(true);
      try {
        const rate = await crossBorderService.getExchangeRate(watchedSourceCurrency, watchedTargetCurrency);
        setExchangeRate(rate);
        toast.success('Exchange rate refreshed');
      } catch (error) {
        toast.error('Failed to refresh exchange rate');
      }
      setExchangeLoading(false);
    }
  };

  const convertedAmount = watchedAmount && exchangeRate ? watchedAmount * exchangeRate.rate : 0;
  const totalDebit = watchedAmount + (fees?.total || 0);

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
                  name="receiverId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Recipient ID or Phone Number"
                      error={!!errors.receiverId}
                      helperText={errors.receiverId?.message || "Enter recipient's ID, phone number, or email"}
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
                  name="receiverName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Recipient Name"
                      error={!!errors.receiverName}
                      helperText={errors.receiverName?.message}
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

              <Grid item xs={12}>
                <Controller
                  name="receiverPhone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Recipient Phone (Optional)"
                      error={!!errors.receiverPhone}
                      helperText={errors.receiverPhone?.message}
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
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="sourceCurrency"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.sourceCurrency}>
                      <InputLabel>From Currency</InputLabel>
                      <Select {...field} label="From Currency">
                        {currencies.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code} - {currency.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="targetCurrency"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.targetCurrency}>
                      <InputLabel>To Currency</InputLabel>
                      <Select {...field} label="To Currency">
                        {currencies.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code} - {currency.name}
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
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Exchange Rate Info */}
            {exchangeRate && (
              <Card sx={{ mt: 3, backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="info.main">
                      Exchange Rate Information
                    </Typography>
                    <IconButton size="small" onClick={refreshExchangeRate} disabled={exchangeLoading}>
                      <Refresh />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Exchange Rate:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      1 {watchedSourceCurrency} = {exchangeRate.rate.toFixed(4)} {watchedTargetCurrency}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">You send:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {watchedAmount} {watchedSourceCurrency}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Recipient gets:</Typography>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {convertedAmount.toFixed(2)} {watchedTargetCurrency}
                    </Typography>
                  </Box>
                  {fees && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Transfer Fee:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {fees.total.toFixed(2)} {fees.currency}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={600}>
                          Total Debit:
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="error">
                          {totalDebit.toFixed(2)} {watchedSourceCurrency}
                        </Typography>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
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
                      {watch('receiverName')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {watch('receiverId')}
                    </Typography>
                    {watch('receiverPhone') && (
                      <Typography variant="body2" color="text.secondary">
                        Phone: {watch('receiverPhone')}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {watchedAmount} {watchedSourceCurrency}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Recipient Gets
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {convertedAmount.toFixed(2)} {watchedTargetCurrency}
                    </Typography>
                  </Grid>
                  {exchangeRate && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Exchange Rate
                      </Typography>
                      <Typography variant="body1">
                        1 {watchedSourceCurrency} = {exchangeRate.rate.toFixed(4)} {watchedTargetCurrency}
                      </Typography>
                    </Grid>
                  )}
                  {fees && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Transfer Fee
                      </Typography>
                      <Typography variant="body1">
                        {fees.total.toFixed(2)} {fees.currency}
                      </Typography>
                    </Grid>
                  )}
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
                    Total Debit
                  </Typography>
                  <Typography variant="h5" color="error" fontWeight={700}>
                    {totalDebit.toFixed(2)} {watchedSourceCurrency}
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
              Your transfer of {watchedAmount} {watchedSourceCurrency} to {watch('receiverName')} has been initiated.
            </Typography>

            {transferResult && (
              <Chip
                label={`Transaction ID: ${transferResult.transferId}`}
                variant="outlined"
                sx={{ mb: 3 }}
              />
            )}

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
                            onClick={activeStep === 2 ? () => handleSubmit(onSubmit as any)() : handleNext}
                            startIcon={activeStep === 2 ? <Send /> : null}
                            disabled={loading}
                          >
                            {loading ? 'Processing...' : activeStep === 2 ? 'Send Money' : 'Continue'}
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
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Transfer Summary
              </Typography>

              {watchedAmount > 0 && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Send Amount:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {watchedAmount} {watchedSourceCurrency}
                      </Typography>
                    </Box>

                    {exchangeRate && watchedSourceCurrency !== watchedTargetCurrency && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Exchange Rate:</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {exchangeRate.rate.toFixed(4)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Recipient Gets:</Typography>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            {convertedAmount.toFixed(2)} {watchedTargetCurrency}
                          </Typography>
                        </Box>
                      </>
                    )}

                    {fees && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Fees:</Typography>
                        <Typography variant="body2">
                          {fees.total.toFixed(2)} {fees.currency}
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Total Debit:
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={600} color="error">
                        {totalDebit.toFixed(2)} {watchedSourceCurrency}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}

              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                <Typography variant="body2">
                  💡 Cross-border transfers typically complete within 1-3 business days.
                </Typography>
              </Alert>

              {exchangeRate && (
                <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Exchange rate updated: {new Date(exchangeRate.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

        </Grid>
      </Grid>
    </Box>
  );
};

export default SendMoney;
