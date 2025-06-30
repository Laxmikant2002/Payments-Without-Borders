import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Send,
  SwapHoriz,
  TrendingUp,
  Refresh,
  Info,
  Schedule,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { crossBorderService, Currency, ExchangeRate } from '../services/crossBorderService';
import { transactionService } from '../services';

interface TransferFormData {
  receiverId: string;
  receiverName: string;
  receiverPhone: string;
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  description: string;
}

const CrossBorderPage: React.FC = () => {
  const [formData, setFormData] = useState<TransferFormData>({
    receiverId: '',
    receiverName: '',
    receiverPhone: '',
    amount: 0,
    sourceCurrency: 'USD',
    targetCurrency: 'EUR',
    description: '',
  });
  
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRate, setLoadingRate] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrencies = async () => {
    try {
      setLoadingCurrencies(true);
      const currenciesData = await crossBorderService.getSupportedCurrencies();
      setCurrencies(currenciesData);
    } catch (err: any) {
      console.error('Failed to fetch currencies:', err);
      toast.error('Failed to load supported currencies');
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const fetchExchangeRate = useCallback(async () => {
    try {
      setLoadingRate(true);
      const rate = await crossBorderService.getExchangeRate(formData.sourceCurrency, formData.targetCurrency);
      setExchangeRate(rate);
    } catch (err: any) {
      console.error('Failed to fetch exchange rate:', err);
      setExchangeRate(null);
    } finally {
      setLoadingRate(false);
    }
  }, [formData.sourceCurrency, formData.targetCurrency]);

  const estimateFees = useCallback(async () => {
    try {
      const estimatedFees = await transactionService.estimateFees(
        formData.amount,
        formData.sourceCurrency,
        formData.targetCurrency,
        'cross_border'
      );
      setFees(estimatedFees);
    } catch (err: any) {
      console.error('Failed to estimate fees:', err);
      setFees(null);
    }
  }, [formData.amount, formData.sourceCurrency, formData.targetCurrency]);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (formData.sourceCurrency && formData.targetCurrency && formData.sourceCurrency !== formData.targetCurrency) {
      fetchExchangeRate();
    }
  }, [fetchExchangeRate, formData.sourceCurrency, formData.targetCurrency]);

  useEffect(() => {
    if (formData.amount > 0 && formData.sourceCurrency && formData.targetCurrency) {
      estimateFees();
    }
  }, [estimateFees, formData.amount, formData.sourceCurrency, formData.targetCurrency]);

  const handleInputChange = (field: keyof TransferFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwapCurrencies = () => {
    setFormData(prev => ({
      ...prev,
      sourceCurrency: prev.targetCurrency,
      targetCurrency: prev.sourceCurrency,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.receiverId || !formData.amount || formData.amount <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await crossBorderService.initiateTransfer({
        receiverId: formData.receiverId,
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        amount: formData.amount,
        sourceCurrency: formData.sourceCurrency,
        targetCurrency: formData.targetCurrency,
        description: formData.description,
      });
      
      toast.success('Cross-border transfer initiated successfully!');
      
      // Reset form
      setFormData({
        receiverId: '',
        receiverName: '',
        receiverPhone: '',
        amount: 0,
        sourceCurrency: 'USD',
        targetCurrency: 'EUR',
        description: '',
      });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const convertedAmount = exchangeRate && formData.amount > 0 
    ? formData.amount * exchangeRate.rate 
    : 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cross-Border Payments
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Send money internationally with competitive exchange rates and low fees.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Transfer Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transfer Details
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    {/* Receiver Information */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Receiver Information
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Receiver ID / Email"
                        value={formData.receiverId}
                        onChange={(e) => handleInputChange('receiverId', e.target.value)}
                        required
                        placeholder="receiver@example.com"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Receiver Name"
                        value={formData.receiverName}
                        onChange={(e) => handleInputChange('receiverName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Receiver Phone"
                        value={formData.receiverPhone}
                        onChange={(e) => handleInputChange('receiverPhone', e.target.value)}
                        placeholder="+1234567890"
                      />
                    </Grid>
                    
                    {/* Amount and Currency */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mt: 2 }}>
                        Transfer Amount
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={formData.amount || ''}
                        onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                        required
                        inputProps={{ min: 0.01, step: 0.01 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth disabled={loadingCurrencies}>
                        <InputLabel>From Currency</InputLabel>
                        <Select
                          value={formData.sourceCurrency}
                          onChange={(e) => handleInputChange('sourceCurrency', e.target.value)}
                          label="From Currency"
                        >
                          {currencies.map((currency) => (
                            <MenuItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Tooltip title="Swap currencies">
                        <IconButton onClick={handleSwapCurrencies} color="primary">
                          <SwapHoriz />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth disabled={loadingCurrencies}>
                        <InputLabel>To Currency</InputLabel>
                        <Select
                          value={formData.targetCurrency}
                          onChange={(e) => handleInputChange('targetCurrency', e.target.value)}
                          label="To Currency"
                        >
                          {currencies.map((currency) => (
                            <MenuItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title="Refresh rate">
                        <IconButton onClick={fetchExchangeRate} disabled={loadingRate}>
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    
                    {/* Description */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description (Optional)"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        multiline
                        rows={2}
                        placeholder="Purpose of transfer..."
                      />
                    </Grid>
                    
                    {/* Error Display */}
                    {error && (
                      <Grid item xs={12}>
                        <Alert severity="error">{error}</Alert>
                      </Grid>
                    )}
                    
                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                        size="large"
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        {loading ? 'Processing...' : 'Initiate Transfer'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Transfer Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transfer Summary
                </Typography>
                
                {/* Exchange Rate */}
                {loadingRate ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2">Loading exchange rate...</Typography>
                  </Box>
                ) : exchangeRate ? (
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TrendingUp color="primary" />
                      <Typography variant="subtitle2">Exchange Rate</Typography>
                    </Box>
                    <Typography variant="h6">
                      1 {formData.sourceCurrency} = {exchangeRate.rate.toFixed(4)} {formData.targetCurrency}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Updated: {new Date(exchangeRate.timestamp).toLocaleString()}
                    </Typography>
                  </Paper>
                ) : null}
                
                {/* Amount Conversion */}
                {formData.amount > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      You send:
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(formData.amount, formData.sourceCurrency)}
                    </Typography>
                    
                    {convertedAmount > 0 && (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Recipient receives:
                        </Typography>
                        <Typography variant="h5" color="success.main">
                          {formatCurrency(convertedAmount, formData.targetCurrency)}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                {/* Fees Breakdown */}
                {fees && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Fee Breakdown:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Platform Fee:</Typography>
                      <Typography variant="body2">
                        {formatCurrency(fees.platformFee || fees.serviceFee, fees.currency)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Network Fee:</Typography>
                      <Typography variant="body2">
                        {formatCurrency(fees.networkFee, fees.currency)}
                      </Typography>
                    </Box>
                    {fees.exchangeFee && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Exchange Fee:</Typography>
                        <Typography variant="body2">
                          {formatCurrency(fees.exchangeFee, fees.currency)}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">Total Fees:</Typography>
                      <Typography variant="subtitle2" color="error">
                        {formatCurrency(fees.total, fees.currency)}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {/* Transfer Info */}
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Schedule fontSize="small" />
                    <Typography variant="body2">
                      Estimated delivery: 1-3 business days
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info fontSize="small" />
                    <Typography variant="body2">
                      Competitive exchange rates updated in real-time
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CrossBorderPage;
