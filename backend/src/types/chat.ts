import { Types } from "mongoose";
import { IChat } from "../models/Chat";
import { IMessage } from "../models/Message";
import { UserShort } from "./user";

export interface PopulatedChat
  extends Omit<IChat, "participants" | "lastMessage"> {
  participants: UserShort[];
  lastMessage?: PopulatedMessage;
}

export interface ChatWithParticipants extends PopulatedChat {
  unreadCount?: number;
}

export interface PopulatedMessage
  extends Omit<IMessage, "sender" | "chat" | "replyTo" | "readBy"> {
  sender: UserShort;
  chat: Types.ObjectId;
  replyTo?: PopulatedMessage;
  readBy: UserShort[];
}

export interface MessageWithSender extends PopulatedMessage {}

export interface CreateChatData {
  participantIds: Types.ObjectId[];
  chatType?: "direct" | "group";
}

export interface SendMessageData {
  chatId: Types.ObjectId;
  text?: string;
  attachments?: {
    type: "image" | "video" | "file";
    url: string;
    filename?: string;
    size?: number;
  }[];
  replyTo?: Types.ObjectId;
}

export interface MarkAsReadData {
  messageId: Types.ObjectId;
  chatId: Types.ObjectId;
}
