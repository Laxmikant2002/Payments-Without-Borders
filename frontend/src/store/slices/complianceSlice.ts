import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { KYCStatus, AMLStatus, KYCDocument, DocumentType } from '../../types';
import { complianceService } from '../../services';

export interface ComplianceState {
  kycStatus: KYCStatus;
  amlStatus: AMLStatus;
  kycDocuments: KYCDocument[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  riskScore?: number;
  lastAmlCheck?: Date;
}

const initialState: ComplianceState = {
  kycStatus: 'not_started',
  amlStatus: 'not_checked',
  kycDocuments: [],
  isLoading: false,
  isUploading: false,
  error: null,
};

// Async thunks
export const getKycStatus = createAsyncThunk(
  'compliance/getKycStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await complianceService.getKYCStatus();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch KYC status');
    }
  }
);

export const uploadKycDocument = createAsyncThunk(
  'compliance/uploadKycDocument',
  async (data: { type: DocumentType; file: File; documentNumber: string }, { rejectWithValue }) => {
    try {
      const response = await complianceService.uploadDocument(data.type, data.documentNumber, data.file);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload KYC document');
    }
  }
);

export const submitKycApplication = createAsyncThunk(
  'compliance/submitKycApplication',
  async (_, { rejectWithValue }) => {
    try {
      const response = await complianceService.submitKycApplication();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit KYC application');
    }
  }
);

export const getAmlStatus = createAsyncThunk(
  'compliance/getAmlStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await complianceService.getAmlStatus();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch AML status');
    }
  }
);

export const requestAmlCheck = createAsyncThunk(
  'compliance/requestAmlCheck',
  async (_, { rejectWithValue }) => {
    try {
      const response = await complianceService.requestAmlCheck();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to request AML check');
    }
  }
);

const complianceSlice = createSlice({
  name: 'compliance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateKycStatus: (state, action: PayloadAction<KYCStatus>) => {
      state.kycStatus = action.payload;
    },
    updateAmlStatus: (state, action: PayloadAction<AMLStatus>) => {
      state.amlStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get KYC status
      .addCase(getKycStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getKycStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.kycStatus = action.payload.kycStatus;
        state.amlStatus = action.payload.amlStatus;
        state.kycDocuments = action.payload.documents || [];
      })
      .addCase(getKycStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload KYC document
      .addCase(uploadKycDocument.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadKycDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        state.kycDocuments.push(action.payload);
      })
      .addCase(uploadKycDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      })
      // Submit KYC application
      .addCase(submitKycApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitKycApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.kycStatus = action.payload.status;
      })
      .addCase(submitKycApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get AML status
      .addCase(getAmlStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAmlStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.amlStatus = action.payload.status;
        if (action.payload.riskScore !== undefined) {
          state.riskScore = action.payload.riskScore;
        }
        if (action.payload.lastCheck !== undefined) {
          state.lastAmlCheck = action.payload.lastCheck;
        }
      })
      .addCase(getAmlStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Request AML check
      .addCase(requestAmlCheck.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestAmlCheck.fulfilled, (state, action) => {
        state.isLoading = false;
        state.amlStatus = action.payload.status;
        if (action.payload.riskScore !== undefined) {
          state.riskScore = action.payload.riskScore;
        }
        state.lastAmlCheck = new Date();
      })
      .addCase(requestAmlCheck.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateKycStatus, updateAmlStatus } = complianceSlice.actions;
export default complianceSlice.reducer;
