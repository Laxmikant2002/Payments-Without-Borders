import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh,
  FilterList,
  Visibility,
  TrendingUp,
  TrendingDown,
  SwapHoriz,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { transactionService } from '../services';
import { Transaction, TransactionStatus, TransactionType } from '../types';

interface TransactionFilters {
  status?: TransactionStatus[];
  type?: TransactionType[];
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
}

const statusColors: Record<TransactionStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'error',
  cancelled: 'default',
  expired: 'error',
};

const statusOptions: TransactionStatus[] = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'expired'];
const typeOptions: TransactionType[] = ['domestic', 'cross_border', 'wallet_to_wallet', 'bank_transfer'];

const typeIcons: Record<TransactionType, React.ReactNode> = {
  domestic: <SwapHoriz />,
  cross_border: <TrendingUp />,
  wallet_to_wallet: <SwapHoriz />,
  bank_transfer: <TrendingDown />,
};

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await transactionService.getTransactions(filters, {
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      setTransactions(response.data.items);
      setTotalPages(response.data.pagination.totalPages);
      setPage(response.data.pagination.currentPage);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
      toast.error(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    fetchTransactions(value);
  };

  const handleRefresh = () => {
    fetchTransactions(page);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusText = (status: TransactionStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const getTypeText = (type: TransactionType) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Transactions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'contained' : 'outlined'}
          >
            Filters
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.status || []}
                  onChange={(e) => setFilters({...filters, status: e.target.value as TransactionStatus[]})}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={getStatusText(value)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {getStatusText(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  multiple
                  value={filters.type || []}
                  onChange={(e) => setFilters({...filters, type: e.target.value as TransactionType[]})}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={getTypeText(value)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {typeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {getTypeText(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Min Amount"
                type="number"
                value={filters.minAmount?.toString() || ''}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value > 0) {
                    setFilters({...filters, minAmount: value});
                  } else {
                    const { minAmount, ...rest } = filters;
                    setFilters(rest);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Max Amount"
                type="number"
                value={filters.maxAmount?.toString() || ''}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value > 0) {
                    setFilters({...filters, maxAmount: value});
                  } else {
                    const { maxAmount, ...rest } = filters;
                    setFilters(rest);
                  }
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Transactions Table */}
      {!loading && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Fees</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No transactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {typeIcons[transaction.type]}
                          <Typography variant="body2">
                            {getTypeText(transaction.type)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </Typography>
                          {transaction.targetCurrency && transaction.exchangeRate && (
                            <Typography variant="caption" color="text.secondary">
                              ≈ {formatCurrency(transaction.amount * transaction.exchangeRate, transaction.targetCurrency)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(transaction.status)}
                          color={statusColors[transaction.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(new Date(transaction.createdAt))}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(new Date(transaction.createdAt))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {transaction.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(transaction.fees.total, transaction.fees.currency || transaction.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default TransactionsPage;
