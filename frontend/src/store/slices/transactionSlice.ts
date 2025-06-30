import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, TransferFormData, TransactionStatus, TransactionFilters, QueryParams } from '../../types';
import { transactionService } from '../../services';

export interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  recentTransactions: Transaction[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  totalAmount: number;
  totalCount: number;
  filters: {
    status?: TransactionStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: TransactionState = {
  transactions: [],
  currentTransaction: null,
  recentTransactions: [],
  isLoading: false,
  isCreating: false,
  error: null,
  totalAmount: 0,
  totalCount: 0,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params: { filters?: TransactionFilters; queryParams?: QueryParams }, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions(params.filters, params.queryParams);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  }
);

export const createDomesticTransaction = createAsyncThunk(
  'transactions/createDomesticTransaction',
  async (transactionData: TransferFormData, { rejectWithValue }) => {
    try {
      const response = await transactionService.initiateDomesticTransfer(transactionData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create transaction');
    }
  }
);

export const createCrossBorderTransaction = createAsyncThunk(
  'transactions/createCrossBorderTransaction',
  async (transactionData: TransferFormData, { rejectWithValue }) => {
    try {
      const response = await transactionService.initiateCrossBorderTransfer(transactionData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create cross-border transaction');
    }
  }
);

export const getTransactionById = createAsyncThunk(
  'transactions/getTransactionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactionById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transaction');
    }
  }
);

export const getTransactionStats = createAsyncThunk(
  'transactions/getTransactionStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactionStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transaction stats');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    updateTransactionStatus: (state, action: PayloadAction<{ id: string; status: TransactionStatus }>) => {
      const transaction = state.transactions.find(t => t.id === action.payload.id);
      if (transaction) {
        transaction.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.data) {
          state.transactions = action.payload.data.items;
          state.pagination = {
            page: action.payload.data.pagination.currentPage,
            limit: 10,
            total: action.payload.data.pagination.total,
          };
        }
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create domestic transaction
      .addCase(createDomesticTransaction.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createDomesticTransaction.fulfilled, (state, action) => {
        state.isCreating = false;
        state.transactions.unshift(action.payload);
        state.currentTransaction = action.payload;
      })
      .addCase(createDomesticTransaction.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Create cross-border transaction
      .addCase(createCrossBorderTransaction.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCrossBorderTransaction.fulfilled, (state, action) => {
        state.isCreating = false;
        state.transactions.unshift(action.payload);
        state.currentTransaction = action.payload;
      })
      .addCase(createCrossBorderTransaction.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Get transaction by ID
      .addCase(getTransactionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(getTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get transaction stats
      .addCase(getTransactionStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.totalAmount = action.payload.totalAmount || 0;
        state.totalCount = action.payload.totalTransactions || 0;
      })
      .addCase(getTransactionStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setFilters,
  setPagination,
  clearCurrentTransaction,
  updateTransactionStatus,
} = transactionSlice.actions;

export default transactionSlice.reducer;
