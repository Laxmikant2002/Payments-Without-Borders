import { User } from '../types/index';

export class StorageService {
  private readonly TOKEN_KEY = 'paymentsBorders_token';
  private readonly REFRESH_TOKEN_KEY = 'paymentsBorders_refreshToken';
  private readonly USER_KEY = 'paymentsBorders_user';
  private readonly PREFERENCES_KEY = 'paymentsBorders_preferences';

  // Token management
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Refresh token management
  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // User data management
  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.removeUser();
        return null;
      }
    }
    return null;
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Preferences management
  setPreferences(preferences: Record<string, any>): void {
    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
  }

  getPreferences(): Record<string, any> | null {
    const prefsStr = localStorage.getItem(this.PREFERENCES_KEY);
    if (prefsStr) {
      try {
        return JSON.parse(prefsStr);
      } catch (error) {
        console.error('Error parsing preferences:', error);
        this.removePreferences();
        return null;
      }
    }
    return null;
  }

  removePreferences(): void {
    localStorage.removeItem(this.PREFERENCES_KEY);
  }

  // Clear all stored data
  clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
    this.removePreferences();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  // Session storage methods (for temporary data)
  setSessionData(key: string, data: any): void {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  getSessionData<T>(key: string): T | null {
    const dataStr = sessionStorage.getItem(key);
    if (dataStr) {
      try {
        return JSON.parse(dataStr);
      } catch (error) {
        console.error('Error parsing session data:', error);
        sessionStorage.removeItem(key);
        return null;
      }
    }
    return null;
  }

  removeSessionData(key: string): void {
    sessionStorage.removeItem(key);
  }

  clearSessionData(): void {
    sessionStorage.clear();
  }
}

export const storageService = new StorageService();
