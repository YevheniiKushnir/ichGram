import { Types } from "mongoose";
import { INotification } from "../models/Notification";
import { UserShort } from "./user";

export type NotificationType =
  | "like"
  | "comment"
  | "follow"
  | "mention"
  | "message"
  | "reply";

export interface PopulatedNotification
  extends Omit<
    INotification,
    "sender" | "recipient" | "post" | "comment" | "message"
  > {
  sender: UserShort;
  recipient: UserShort;
  post?: { _id: Types.ObjectId; image?: string };
  comment?: { _id: Types.ObjectId; text: string };
  message?: { _id: Types.ObjectId; text?: string };
}

export interface NotificationWithSender extends PopulatedNotification {
  // for virtual fields
}

export interface CreateNotificationData {
  recipientId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: NotificationType;
  postId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  messageId?: Types.ObjectId;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}
