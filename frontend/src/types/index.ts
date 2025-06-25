export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
  lastLogin?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

export interface PropsWithChildren {
  children: React.ReactNode;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
    expiresIn?: number;
  };
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}