import { io, Socket } from 'socket.io-client';
import { storageService } from './storageService';
import {
  Transaction,
  Notification,
  KYCStatus,
  SystemAlert
} from '../types/index';

type EventCallback<T = any> = (data: T) => void;

export class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private listeners: Map<string, EventCallback[]> = new Map();

  constructor(private baseUrl: string = import.meta.env.VITE_SOCKET_URL || window.location.origin) {}

  // Connect to WebSocket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = storageService.getToken();
        
        this.socket = io(this.baseUrl, {
          auth: {
            token: token
          },
          transports: ['websocket'],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          timeout: 10000
        });

        this.setupEventListeners();
        
        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('WebSocket connected');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          this.isConnected = false;
          
          // Auto-reconnect if disconnected unexpectedly
          if (reason === 'io server disconnect') {
            this.socket?.connect();
          }
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
          this.isConnected = true;
          this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('WebSocket reconnection error:', error);
          this.reconnectAttempts++;
        });

        this.socket.on('reconnect_failed', () => {
          console.error('WebSocket reconnection failed after max attempts');
          this.isConnected = false;
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('WebSocket disconnected manually');
    }
  }

  // Check connection status
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Handle authentication errors
    this.socket.on('auth_error', (error) => {
      console.error('WebSocket authentication error:', error);
      storageService.clearAll();
      window.location.href = '/login';
    });

    // Handle server errors
    this.socket.on('error', (error) => {
      console.error('WebSocket server error:', error);
      this.emit('error', error);
    });

    // Handle pong for ping/pong heartbeat
    this.socket.on('pong', () => {
      // Handle pong response if needed
    });
  }

  // Join user room for personalized updates
  joinRoom(userId: string): void {
    if (this.isSocketConnected() && this.socket) {
      this.socket.emit('join-room', userId);
    }
  }

  // Leave user room
  leaveRoom(userId: string): void {
    if (this.isSocketConnected() && this.socket) {
      this.socket.emit('leave-room', userId);
    }
  }

  // Subscribe to transaction updates
  subscribeToTransactions(callback: EventCallback<Transaction>): () => void {
    return this.on('transaction-update', callback);
  }

  // Subscribe to notifications
  subscribeToNotifications(callback: EventCallback<Notification>): () => void {
    return this.on('new-notification', callback);
  }

  // Subscribe to KYC status updates
  subscribeToKYCUpdates(callback: EventCallback<KYCStatus>): () => void {
    return this.on('kyc-status-update', callback);
  }

  // Subscribe to system alerts
  subscribeToSystemAlerts(callback: EventCallback<SystemAlert>): () => void {
    return this.on('system-alert', callback);
  }

  // Subscribe to exchange rate updates
  subscribeToExchangeRates(callback: EventCallback<{
    from: string;
    to: string;
    rate: number;
    timestamp: Date;
  }>): () => void {
    return this.on('exchange-rate-update', callback);
  }

  // Subscribe to transfer status updates
  subscribeToTransferUpdates(callback: EventCallback<{
    transferId: string;
    status: string;
    timestamp: Date;
    details?: any;
  }>): () => void {
    return this.on('transfer-status-update', callback);
  }

  // Generic event listener
  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  // Remove event listener
  off<T = any>(event: string, callback: EventCallback<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit event to server
  emit(event: string, data?: any): void {
    if (this.isSocketConnected() && this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit event: WebSocket not connected');
    }
  }

  // Send ping to check connection
  ping(): void {
    if (this.isSocketConnected() && this.socket) {
      this.socket.emit('ping');
    }
  }

  // Get connection info
  getConnectionInfo(): {
    isConnected: boolean;
    socketId: string | undefined;
    transport: string | undefined;
    reconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      transport: this.socket?.io.engine?.transport?.name,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Manually attempt reconnection
  reconnect(): void {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  // Update authentication token
  updateAuth(token: string): void {
    if (this.socket) {
      this.socket.auth = { token };
      
      // Reconnect with new token if currently connected
      if (this.isConnected) {
        this.socket.disconnect();
        this.socket.connect();
      }
    }
  }

  // Subscribe to room-specific events
  subscribeToRoom(room: string, callback: EventCallback): () => void {
    const event = `room:${room}`;
    return this.on(event, callback);
  }

  // Unsubscribe from room-specific events
  unsubscribeFromRoom(room: string, callback: EventCallback): void {
    const event = `room:${room}`;
    this.off(event, callback);
  }

  // Join specific room
  joinSpecificRoom(room: string): void {
    this.emit('join-room', room);
  }

  // Leave specific room
  leaveSpecificRoom(room: string): void {
    this.emit('leave-room', room);
  }

  // Handle user going online/offline
  setUserStatus(status: 'online' | 'offline' | 'away'): void {
    this.emit('user-status', { status, timestamp: new Date() });
  }

  // Request real-time data
  requestRealTimeData(dataType: string, params?: any): void {
    this.emit('request-real-time-data', { dataType, params });
  }

  // Stop real-time data
  stopRealTimeData(dataType: string): void {
    this.emit('stop-real-time-data', { dataType });
  }
}

// Create singleton instance
export const socketService = new SocketService();

// Auto-connect when user is authenticated
if (storageService.isAuthenticated()) {
  socketService.connect().catch(console.error);
}
