import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MojaloopStatus, PartyLookupRequest, PartyLookupResponse } from '../../types';
import { mojaloopService } from '../../services';

export interface MojaloopState {
  status: MojaloopStatus | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  partyLookupResults: PartyLookupResponse | null;
  isLookingUp: boolean;
  lastHealthCheck?: Date;
}

const initialState: MojaloopState = {
  status: null,
  isConnected: false,
  isLoading: false,
  error: null,
  partyLookupResults: null,
  isLookingUp: false,
};

// Async thunks
export const getStatus = createAsyncThunk(
  'mojaloop/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mojaloopService.getStatus();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch Mojaloop status');
    }
  }
);

export const performHealthCheck = createAsyncThunk(
  'mojaloop/performHealthCheck',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mojaloopService.healthCheck();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Health check failed');
    }
  }
);

export const lookupParty = createAsyncThunk(
  'mojaloop/lookupParty',
  async (lookupData: PartyLookupRequest, { rejectWithValue }) => {
    try {
      const response = await mojaloopService.lookupParty(lookupData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Party lookup failed');
    }
  }
);

const mojaloopSlice = createSlice({
  name: 'mojaloop',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPartyLookupResults: (state) => {
      state.partyLookupResults = null;
    },
    updateConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get status
      .addCase(getStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = action.payload;
        state.isConnected = action.payload.connected;
        state.lastHealthCheck = action.payload.lastHealthCheck;
      })
      .addCase(getStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isConnected = false;
      })
      // Perform health check
      .addCase(performHealthCheck.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performHealthCheck.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isConnected = action.payload.connected;
        state.lastHealthCheck = new Date();
      })
      .addCase(performHealthCheck.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isConnected = false;
      })
      // Lookup party
      .addCase(lookupParty.pending, (state) => {
        state.isLookingUp = true;
        state.error = null;
        state.partyLookupResults = null;
      })
      .addCase(lookupParty.fulfilled, (state, action) => {
        state.isLookingUp = false;
        state.partyLookupResults = action.payload;
      })
      .addCase(lookupParty.rejected, (state, action) => {
        state.isLookingUp = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearPartyLookupResults,
  updateConnectionStatus,
} = mojaloopSlice.actions;

export default mojaloopSlice.reducer;
