import { get, put } from './api';
import type { ApiResponse, Notification } from '@/types';

export interface NotificationListResult {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const notificationService = {
  getNotifications: () =>
    get<ApiResponse<NotificationListResult>>('/notifications'),

  markAsRead: (id: string) =>
    put<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    put<ApiResponse<null>>('/notifications/read-all'),

  getUnreadCount: () =>
    get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
};
