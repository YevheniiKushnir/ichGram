import { Chat } from "../models/Chat";
import { Message } from "../models/Message";
import { Types } from "mongoose";
import { AppError } from "../utils/AppError";
import {
  ChatWithParticipants,
  CreateChatData,
  SendMessageData,
  PopulatedChat,
  PopulatedMessage,
  MessageWithSender,
} from "../types/chat";
import { NotificationService } from "./notificationService";
import { SocketService } from "./socketService";
import { UserShort } from "../types/user";

export class ChatService {
  private static mapChatToResponse = (
    chat: PopulatedChat,
    userId?: Types.ObjectId
  ): ChatWithParticipants => {
    const unreadCount =
      chat.unreadCounts.find((uc) => uc.userId.equals(userId!))?.count || 0;

    return {
      ...chat,
      unreadCount,
    };
  };

  private static mapMessageToResponse = (
    message: PopulatedMessage
  ): MessageWithSender => {
    return { ...message };
  };

  static async findOrCreateChat(
    creatorId: Types.ObjectId,
    chatData: CreateChatData
  ): Promise<ChatWithParticipants> {
    const { participantIds, chatType = "direct" } = chatData;

    // For direct chat, we are looking for an existing one.
    if (chatType === "direct" && participantIds.length === 1) {
      const existingChat = await Chat.findOne({
        participants: { $all: [creatorId, ...participantIds] },
        chatType: "direct",
      }).populate<PopulatedChat>([
        { path: "participants", select: "username fullName avatarUrl" },
        {
          path: "lastMessage",
          populate: { path: "sender", select: "username fullName avatarUrl" },
        },
      ]);

      if (existingChat) {
        return this.mapChatToResponse(existingChat, creatorId);
      }
    }

    // Creating a new chat
    const allParticipants = [creatorId, ...participantIds];
    const chat = await Chat.create({
      participants: allParticipants,
      chatType,
      unreadCounts: allParticipants.map((userId) => ({
        userId,
        count: userId.equals(creatorId) ? 0 : 1, // The creator sees 0 unread messages.
      })),
    });

    const populatedChat = await Chat.findById(chat._id).populate<PopulatedChat>(
      [{ path: "participants", select: "username fullName avatarUrl" }]
    );

    if (!populatedChat) {
      throw new AppError("Chat not found after creation", 500);
    }

    return this.mapChatToResponse(populatedChat, creatorId);
  }

  static async getUserChats(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 20
  ): Promise<ChatWithParticipants[]> {
    const chats = await Chat.find({ participants: userId })
      .populate<PopulatedChat>([
        { path: "participants", select: "username fullName avatarUrl" },
        {
          path: "lastMessage",
          populate: { path: "sender", select: "username fullName avatarUrl" },
        },
      ])
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return chats.map((chat) => this.mapChatToResponse(chat, userId));
  }

  static async sendMessage(
    senderId: Types.ObjectId,
    messageData: SendMessageData
  ): Promise<MessageWithSender> {
    const { chatId, text, attachments, replyTo } = messageData;

    // Verify that the user is a chat participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: senderId,
    }).populate<{ participants: UserShort[] }>(
      "participants",
      "username fullName avatarUrl"
    );

    if (!chat) {
      throw new AppError("Chat not found or access denied", 404);
    }

    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      text,
      attachments,
      replyTo,
    });

    const sender = chat.participants.find((p) => p._id.equals(senderId));
    if (!sender) {
      throw new AppError("Sender not found in chat participants", 500);
    }

    // Refresh the last message in the chat
    await Chat.findByIdAndUpdate(
      chatId,
      {
        lastMessage: message._id,
        $inc: {
          "unreadCounts.$[elem].count": 1,
        },
      },
      {
        arrayFilters: [{ "elem.userId": { $ne: senderId } }], // Increase the counter for everyone except the sender
      }
    );

    const populatedMessage = await Message.findById(
      message._id
    ).populate<PopulatedMessage>([
      { path: "sender", select: "username fullName avatarUrl" },
      {
        path: "replyTo",
        populate: { path: "sender", select: "username fullName avatarUrl" },
      },
      { path: "readBy", select: "username fullName avatarUrl" },
    ]);

    if (!populatedMessage) {
      throw new AppError("Message not found after creation", 500);
    }

    // INTEGRATION: Sending notifications via WebSocket
    SocketService.emitNewMessage(chatId.toString(), {
      ...populatedMessage.toObject(), // ✅ Теперь с правильным типом
      sender: sender,
    });

    // INTEGRATION: Notifications for all chat participants (except the sender)
    const notificationPromises = chat.participants
      .filter((participant) => !participant._id.equals(senderId))
      .map((participant) =>
        NotificationService.createNotification({
          recipientId: participant._id,
          senderId: senderId,
          type: "message",
          messageId: message._id,
          chatId: chatId,
        })
      );

    await Promise.all(notificationPromises);

    return this.mapMessageToResponse(populatedMessage);
  }

  static async getChatMessages(
    chatId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 50
  ): Promise<MessageWithSender[]> {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      throw new AppError("Chat not found or access denied", 404);
    }

    const messages = await Message.find({ chat: chatId, isDeleted: false })
      .populate<PopulatedMessage>([
        { path: "sender", select: "username fullName avatarUrl" },
        {
          path: "replyTo",
          populate: { path: "sender", select: "username fullName avatarUrl" },
        },
        { path: "readBy", select: "username fullName avatarUrl" },
      ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return messages.map((message) => this.mapMessageToResponse(message));
  }

  static async markAsRead(
    chatId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<void> {
    await Chat.findOneAndUpdate(
      {
        _id: chatId,
        participants: userId,
      },
      {
        $set: {
          "unreadCounts.$[elem].count": 0,
        },
      },
      {
        arrayFilters: [{ "elem.userId": userId }],
      }
    );

    await Message.updateMany(
      {
        chat: chatId,
        readBy: { $ne: userId },
      },
      {
        $addToSet: { readBy: userId },
      }
    );
    //  INTEGRATION: Notify via WebSocket when read
    SocketService.emitMessageRead(chatId.toString(), {
      userId: userId.toString(),
      timestamp: new Date(),
    });
  }

  static async deleteMessage(
    messageId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<void> {
    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        sender: userId,
      },
      {
        isDeleted: true,
        text: "Message deleted",
        attachments: [],
      },
      { new: true }
    );

    if (!message) {
      throw new AppError("Message not found or access denied", 404);
    }
  }

  static async getChatById(
    chatId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<ChatWithParticipants> {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    }).populate<PopulatedChat>([
      { path: "participants", select: "username fullName avatarUrl" },
      {
        path: "lastMessage",
        populate: { path: "sender", select: "username fullName avatarUrl" },
      },
    ]);

    if (!chat) {
      throw new AppError("Chat not found or access denied", 404);
    }

    return this.mapChatToResponse(chat, userId);
  }

  static async getOrCreateDirectChat(
    userId1: Types.ObjectId,
    userId2: Types.ObjectId
  ): Promise<ChatWithParticipants> {
    return this.findOrCreateChat(userId1, {
      participantIds: [userId2],
      chatType: "direct",
    });
  }

  static async replyToMessage(
    senderId: Types.ObjectId,
    messageData: SendMessageData & { replyTo: Types.ObjectId }
  ): Promise<MessageWithSender> {
    // We check that the message for reply exists in the same chat.
    const originalMessage = await Message.findOne({
      _id: messageData.replyTo,
      chat: messageData.chatId,
    });

    if (!originalMessage) {
      throw new AppError("Original message not found", 404);
    }

    return this.sendMessage(senderId, messageData);
  }
}
