import { Notification } from "../models/Notification";
import { Types } from "mongoose";
import { AppError } from "../utils/AppError";
import { PopulateOptions } from "mongoose";
import {
  NotificationWithSender,
  CreateNotificationData,
  PopulatedNotification,
} from "../types/notification";

export class NotificationService {
  private static mapNotificationToResponse = (
    notification: PopulatedNotification
  ): NotificationWithSender => {
    return {
      ...notification,
    };
  };
  private static readonly NOTIFICATION_POPULATE: PopulateOptions[] = [
    { path: "sender", select: "username fullName avatarUrl" },
    { path: "recipient", select: "username fullName avatarUrl" },
    { path: "post", select: "images" },
    { path: "comment", select: "text" },
    { path: "message", select: "text" },
    { path: "chat", select: "participants" },
  ];

  static async createNotification(
    notificationData: CreateNotificationData
  ): Promise<NotificationWithSender> {
    const notification = await Notification.create(notificationData);

    const populatedNotification = await Notification.findById(
      notification._id
    ).populate<PopulatedNotification>(this.NOTIFICATION_POPULATE);

    if (!populatedNotification) {
      throw new AppError("Notification not found after creation", 500);
    }

    return this.mapNotificationToResponse(populatedNotification);
  }

  static async getUserNotifications(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 20,
    isRead?: boolean
  ): Promise<NotificationWithSender[]> {
    const query: { recipient: Types.ObjectId; isRead?: boolean } = {
      recipient: userId,
    };

    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    const notifications = await Notification.find(query)
      .populate<PopulatedNotification>(this.NOTIFICATION_POPULATE)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return notifications.map((notification) =>
      this.mapNotificationToResponse(notification)
    );
  }

  static async markAsRead(
    notificationId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<void> {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId,
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
  }

  static async markAllAsRead(userId: Types.ObjectId): Promise<void> {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }

  static async getUnreadCount(userId: Types.ObjectId): Promise<number> {
    return await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
  }

  static async deleteNotification(
    notificationId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<void> {
    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!result) {
      throw new AppError("Notification not found", 404);
    }
  }
}
