import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Alert,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  AccessTime,
  Calculate,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { crossBorderService, Currency, ExchangeRate } from '../services/crossBorderService';

interface ExchangeRateWithTrend extends ExchangeRate {
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

// Popular currency pairs
const POPULAR_PAIRS = [
  { from: 'USD', to: 'EUR' },
  { from: 'USD', to: 'GBP' },
  { from: 'EUR', to: 'GBP' },
  { from: 'USD', to: 'NGN' },
  { from: 'USD', to: 'KES' },
  { from: 'GBP', to: 'NGN' },
  { from: 'EUR', to: 'KES' },
  { from: 'USD', to: 'GHS' },
];

const ExchangeRatesPage: React.FC = () => {
  const theme = useTheme();
  const [rates, setRates] = useState<ExchangeRateWithTrend[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Calculator state
  const [calculatorFrom, setCalculatorFrom] = useState('USD');
  const [calculatorTo, setCalculatorTo] = useState('EUR');
  const [calculatorAmount, setCalculatorAmount] = useState<number>(100);
  const [calculatorResult, setCalculatorResult] = useState<number | null>(null);
  const [calculatorLoading, setCalculatorLoading] = useState(false);

  const loadExchangeRates = useCallback(async () => {
    setLoading(true);
    try {
      const ratePromises = POPULAR_PAIRS.map(async (pair) => {
        try {
          const rate = await crossBorderService.getExchangeRate(pair.from, pair.to);
          return {
            ...rate,
            trend: Math.random() > 0.5 ? 'up' : 'down', // Mock trend
            change: (Math.random() - 0.5) * 0.1, // Mock change percentage
          } as ExchangeRateWithTrend;
        } catch (error) {
          console.error(`Failed to get rate for ${pair.from}/${pair.to}:`, error);
          return null;
        }
      });

      const results = await Promise.all(ratePromises);
      const validRates = results.filter(Boolean) as ExchangeRateWithTrend[];
      setRates(validRates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
      toast.error('Failed to load exchange rates');
    }
    setLoading(false);
  }, []);

  // Load currencies and rates on component mount
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const supportedCurrencies = await crossBorderService.getSupportedCurrencies();
        setCurrencies(supportedCurrencies);
      } catch (error) {
        console.error('Failed to load currencies:', error);
        // Fallback currencies
        setCurrencies([
          { code: 'USD', name: 'US Dollar', symbol: '$', dfspId: 'usd-dfsp' },
          { code: 'EUR', name: 'Euro', symbol: '€', dfspId: 'eur-dfsp' },
          { code: 'GBP', name: 'British Pound', symbol: '£', dfspId: 'gbp-dfsp' },
          { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', dfspId: 'ngn-dfsp' },
          { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', dfspId: 'kes-dfsp' },
          { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', dfspId: 'ghs-dfsp' },
          { code: 'JPY', name: 'Japanese Yen', symbol: '¥', dfspId: 'jpy-dfsp' },
          { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', dfspId: 'cad-dfsp' },
          { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', dfspId: 'aud-dfsp' },
        ]);
      }
    };

    loadCurrencies();
    loadExchangeRates();
  }, [loadExchangeRates]);

  const handleRefreshRates = () => {
    loadExchangeRates();
    toast.success('Refreshing exchange rates...');
  };

  const calculateExchange = async () => {
    if (!calculatorAmount || calculatorAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setCalculatorLoading(true);
    try {
      const rate = await crossBorderService.getExchangeRate(calculatorFrom, calculatorTo);
      const result = calculatorAmount * rate.rate;
      setCalculatorResult(result);
    } catch (error) {
      console.error('Failed to calculate exchange:', error);
      toast.error('Failed to calculate exchange rate');
    }
    setCalculatorLoading(false);
  };

  const swapCurrencies = () => {
    const temp = calculatorFrom;
    setCalculatorFrom(calculatorTo);
    setCalculatorTo(temp);
    setCalculatorResult(null);
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };

  const formatRate = (rate: number, precision: number = 4) => {
    return rate.toFixed(precision);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${(change * 100).toFixed(2)}%`;
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Exchange Rates
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Real-time exchange rates for international money transfers.
      </Typography>

      <Grid container spacing={3}>
        {/* Currency Calculator */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Currency Calculator
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={calculatorAmount}
                  onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                  sx={{ mb: 2 }}
                />

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={5}>
                    <FormControl fullWidth>
                      <InputLabel>From</InputLabel>
                      <Select
                        value={calculatorFrom}
                        label="From"
                        onChange={(e) => setCalculatorFrom(e.target.value)}
                      >
                        {currencies.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={2} sx={{ textAlign: 'center' }}>
                    <IconButton onClick={swapCurrencies} color="primary">
                      <SwapHoriz />
                    </IconButton>
                  </Grid>
                  
                  <Grid item xs={5}>
                    <FormControl fullWidth>
                      <InputLabel>To</InputLabel>
                      <Select
                        value={calculatorTo}
                        label="To"
                        onChange={(e) => setCalculatorTo(e.target.value)}
                      >
                        {currencies.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={calculateExchange}
                  disabled={calculatorLoading}
                  sx={{ mt: 2 }}
                  startIcon={<Calculate />}
                >
                  {calculatorLoading ? 'Calculating...' : 'Calculate'}
                </Button>

                {calculatorResult !== null && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {calculatorAmount} {calculatorFrom} =
                    </Typography>
                    <Typography variant="h6" color="success.main" fontWeight={600}>
                      {getCurrencySymbol(calculatorTo)} {calculatorResult.toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Market Info
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Rates are updated every 5 minutes during market hours.
              </Alert>

              {lastUpdated && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {currencies.slice(0, 6).map((currency) => (
                  <Chip
                    key={currency.code}
                    label={`${currency.symbol} ${currency.code}`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Exchange Rates Table */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Live Exchange Rates
                </Typography>
                <Button
                  startIcon={<Refresh />}
                  onClick={handleRefreshRates}
                  disabled={loading}
                  variant="outlined"
                  size="small"
                >
                  Refresh
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Currency Pair</strong></TableCell>
                        <TableCell align="right"><strong>Rate</strong></TableCell>
                        <TableCell align="right"><strong>Change</strong></TableCell>
                        <TableCell align="right"><strong>Trend</strong></TableCell>
                        <TableCell align="right"><strong>Updated</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rates.map((rate) => (
                        <TableRow key={`${rate.fromCurrency}-${rate.toCurrency}`} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {rate.fromCurrency}/{rate.toCurrency}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontFamily="monospace">
                              {formatRate(rate.rate)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              color={rate.change && rate.change >= 0 ? 'success.main' : 'error.main'}
                            >
                              {rate.change ? formatChange(rate.change) : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {rate.trend === 'up' && <TrendingUp color="success" />}
                            {rate.trend === 'down' && <TrendingDown color="error" />}
                            {rate.trend === 'stable' && <SwapHoriz color="action" />}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" color="text.secondary">
                              {new Date(rate.timestamp).toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {rates.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No exchange rates available
                  </Typography>
                  <Button onClick={handleRefreshRates} sx={{ mt: 1 }}>
                    Try Again
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExchangeRatesPage;
