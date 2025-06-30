import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ApiResponse
} from '../../types/index';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginLoading: boolean;
  registerLoading: boolean;
  logoutLoading: boolean;
  forgotPasswordLoading: boolean;
  resetPasswordLoading: boolean;
}

const initialState: AuthState = {
  user: storageService.getUser(),
  token: storageService.getToken(),
  isAuthenticated: storageService.isAuthenticated(),
  isLoading: false,
  error: null,
  loginLoading: false,
  registerLoading: false,
  logoutLoading: false,
  forgotPasswordLoading: false,
  resetPasswordLoading: false,
};

// Async thunks
export const loginAsync = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerAsync = createAsyncThunk<
  AuthResponse,
  RegisterData,
  { rejectValue: string }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logoutAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      storageService.clearAll();
      return;
    } catch (error: any) {
      storageService.clearAll(); // Clear anyway on error
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const refreshTokenAsync = createAsyncThunk<
  string | null,
  void,
  { rejectValue: string }
>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await authService.refreshToken();
      return token;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const forgotPasswordAsync = createAsyncThunk<
  ApiResponse,
  string,
  { rejectValue: string }
>(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset request failed');
    }
  }
);

export const resetPasswordAsync = createAsyncThunk<
  ApiResponse,
  { token: string; newPassword: string },
  { rejectValue: string }
>(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

export const changePasswordAsync = createAsyncThunk<
  ApiResponse,
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password change failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = storageService.getToken();
      if (!token) {
        return rejectWithValue('No token available');
      }
      
      const user = authService.getCurrentUser();
      if (!user) {
        return rejectWithValue('No user data available');
      }
      
      return user;
    } catch (error: any) {
      storageService.clearAll();
      return rejectWithValue(error.message || 'Failed to get current user');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        storageService.setUser(state.user);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loginLoading = false;
        if (action.payload.success && action.payload.data) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.registerLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.registerLoading = false;
        if (action.payload.success && action.payload.data) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.registerLoading = false;
        state.error = action.payload || 'Registration failed';
        state.isAuthenticated = false;
      })
      
      // Logout
      .addCase(logoutAsync.pending, (state) => {
        state.logoutLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.logoutLoading = false;
        // Clear auth even if logout request failed
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Logout failed';
      })
      
      // Refresh Token
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload;
        }
      })
      .addCase(refreshTokenAsync.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Forgot Password
      .addCase(forgotPasswordAsync.pending, (state) => {
        state.forgotPasswordLoading = true;
        state.error = null;
      })
      .addCase(forgotPasswordAsync.fulfilled, (state) => {
        state.forgotPasswordLoading = false;
        state.error = null;
      })
      .addCase(forgotPasswordAsync.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.error = action.payload || 'Password reset request failed';
      })
      
      // Reset Password
      .addCase(resetPasswordAsync.pending, (state) => {
        state.resetPasswordLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordAsync.fulfilled, (state) => {
        state.resetPasswordLoading = false;
        state.error = null;
      })
      .addCase(resetPasswordAsync.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.error = action.payload || 'Password reset failed';
      })
      
      // Change Password
      .addCase(changePasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password change failed';
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to get current user';
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser, clearAuth, updateUser } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectLoginLoading = (state: { auth: AuthState }) => state.auth.loginLoading;
export const selectRegisterLoading = (state: { auth: AuthState }) => state.auth.registerLoading;

export default authSlice.reducer;
