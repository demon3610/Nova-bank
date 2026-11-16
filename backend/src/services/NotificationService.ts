import { notificationsDb } from "@/database";
import { AppError } from "@/middlewares/errorHandler";

export class NotificationService {
  async createNotification(data: {
    userId: string;
    type: "transaction" | "security" | "promotional" | "system";
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) {
    return notificationsDb.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      isRead: false,
    });
  }

  async getNotifications(userId: string, page: number, limit: number) {
    const all = notificationsDb
      .findMany((n) => n.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const total = all.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const notifications = all.slice(start, start + limit);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = notificationsDb.findOne(
      (n) => n.id === notificationId && n.userId === userId,
    );
    if (!notification) {
      throw new AppError(
        "Notification not found",
        404,
        "NOTIFICATION_NOT_FOUND",
      );
    }

    return notificationsDb.update(notificationId, {
      isRead: true,
      readAt: new Date().toISOString(),
    });
  }

  async markAllAsRead(userId: string) {
    const unread = notificationsDb.findMany(
      (n) => n.userId === userId && n.isRead === false,
    );
    for (const n of unread) {
      notificationsDb.update(n.id, {
        isRead: true,
        readAt: new Date().toISOString(),
      });
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return notificationsDb.count(
      (n) => n.userId === userId && n.isRead === false,
    );
  }
}

export default new NotificationService();
