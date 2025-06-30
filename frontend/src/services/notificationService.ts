import { apiClient } from './apiClient';
import {
  Notification,
  NotificationFilters,
  PaginatedResponse,
  ApiResponse,
  QueryParams
} from '../types/index';

export class NotificationService {
  // Get paginated notifications
  async getNotifications(
    filters?: NotificationFilters,
    queryParams?: QueryParams
  ): Promise<PaginatedResponse<Notification>> {
    try {
      const params = new URLSearchParams();
      
      if (queryParams?.page) params.append('page', queryParams.page.toString());
      if (queryParams?.limit) params.append('limit', queryParams.limit.toString());
      
      if (filters?.unread !== undefined) params.append('unread', filters.unread.toString());
      if (filters?.type) {
        filters.type.forEach(type => params.append('type', type));
      }
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());

      const response = await apiClient.get<PaginatedResponse<Notification>>(
        `/notifications?${params.toString()}`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
      if (response.success && response.data) {
        return response.data.count;
      }
      return 0;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(
        `/notifications/${notificationId}/mark-read`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds: string[]): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/notifications/mark-multiple-read', {
        notificationIds
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark notifications as read');
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/notifications/mark-all-read');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete<ApiResponse>(`/notifications/${notificationId}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  }

  // Delete multiple notifications
  async deleteMultipleNotifications(notificationIds: string[]): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/notifications/delete-multiple', {
        notificationIds
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete notifications');
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete<ApiResponse>('/notifications/clear-all');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to clear notifications');
    }
  }

  // Get notification by ID
  async getNotificationById(notificationId: string): Promise<Notification> {
    try {
      const response = await apiClient.get<ApiResponse<Notification>>(
        `/notifications/${notificationId}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Notification not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification');
    }
  }

  // Create notification (admin only)
  async createNotification(notificationData: {
    userId?: string;
    userIds?: string[];
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    expiresAt?: Date;
    sendEmail?: boolean;
    sendSMS?: boolean;
    sendPush?: boolean;
  }): Promise<Notification> {
    try {
      const response = await apiClient.post<ApiResponse<Notification>>(
        '/notifications',
        notificationData
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Notification creation failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create notification');
    }
  }

  // Send bulk notification (admin only)
  async sendBulkNotification(notificationData: {
    userIds?: string[];
    userFilters?: {
      country?: string;
      kycStatus?: string;
      registeredAfter?: Date;
      registeredBefore?: Date;
    };
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    sendEmail?: boolean;
    sendSMS?: boolean;
    sendPush?: boolean;
  }): Promise<ApiResponse<{ sentCount: number; failedCount: number }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ sentCount: number; failedCount: number }>>(
        '/notifications/bulk',
        notificationData
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send bulk notification');
    }
  }

  // Get notification templates (admin only)
  async getNotificationTemplates(): Promise<Array<{
    id: string;
    name: string;
    type: string;
    subject: string;
    body: string;
    variables: string[];
    isActive: boolean;
  }>> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/notifications/templates');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification templates');
    }
  }

  // Update notification template (admin only)
  async updateNotificationTemplate(templateId: string, templateData: {
    name?: string;
    subject?: string;
    body?: string;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    try {
      const response = await apiClient.put<ApiResponse>(
        `/notifications/templates/${templateId}`,
        templateData
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update notification template');
    }
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications(subscription: PushSubscription): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/notifications/push/subscribe', {
        subscription: subscription.toJSON()
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to subscribe to push notifications');
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications(endpoint: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/notifications/push/unsubscribe', {
        endpoint
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unsubscribe from push notifications');
    }
  }

  // Test notification (admin only)
  async testNotification(userId: string, type: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/notifications/test', {
        userId,
        type
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send test notification');
    }
  }

  // Get notification statistics (admin only)
  async getNotificationStats(startDate?: Date, endDate?: Date): Promise<{
    totalSent: number;
    totalRead: number;
    readRate: number;
    byType: Record<string, number>;
    byChannel: Record<string, number>;
    deliveryStats: {
      email: { sent: number; delivered: number; failed: number };
      sms: { sent: number; delivered: number; failed: number };
      push: { sent: number; delivered: number; failed: number };
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await apiClient.get<ApiResponse<any>>(
        `/notifications/stats?${params.toString()}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Stats fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification stats');
    }
  }
}

export const notificationService = new NotificationService();
