import { Request, Response } from "express";
import { Types } from "mongoose";
import { NotificationService } from "../services/notificationService";
import { AuthUtils } from "../utils/authUtils";

export class NotificationController {
  static async getNotifications(req: Request, res: Response): Promise<void> {
    const { page = "1", limit = "20", isRead } = req.query;
    const userId = AuthUtils.getUserId(req);

    const notifications = await NotificationService.getUserNotifications(
      userId,
      parseInt(page as string),
      parseInt(limit as string),
      isRead ? isRead === "true" : undefined
    );

    res.json(notifications);
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    const userId = AuthUtils.getUserId(req);

    await NotificationService.markAsRead(
      new Types.ObjectId(notificationId),
      userId
    );

    res.json({ message: "Notification marked as read" });
  }

  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    const userId = AuthUtils.getUserId(req);

    await NotificationService.markAllAsRead(userId);

    res.json({ message: "All notifications marked as read" });
  }

  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    const userId = AuthUtils.getUserId(req);

    const count = await NotificationService.getUnreadCount(userId);

    res.json({ unreadCount: count });
  }

  static async deleteNotification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    const userId = AuthUtils.getUserId(req);

    await NotificationService.deleteNotification(
      new Types.ObjectId(notificationId),
      userId
    );

    res.json({ message: "Notification deleted successfully" });
  }
}