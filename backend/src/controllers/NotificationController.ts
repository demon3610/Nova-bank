import { Response, NextFunction } from "express";
import { RequestWithUser } from "@/types";
import NotificationService from "@/services/NotificationService";
import { success } from "@/utils/apiResponse";

export class NotificationController {
  async getNotifications(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await NotificationService.getNotifications(
        req.user!.userId,
        page,
        limit,
      );
      success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async markRead(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(
        id,
        req.user!.userId,
      );
      success(res, notification, "Notification marked as read");
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await NotificationService.markAllAsRead(req.user!.userId);
      success(res, null, "All notifications marked as read");
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const count = await NotificationService.getUnreadCount(req.user!.userId);
      success(res, { count });
    } catch (err) {
      next(err);
    }
  }
}

export default new NotificationController();
