// controllers/chatController.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import { ChatService } from "../services/chatService";
import { AuthUtils } from "../utils/authUtils";
import { AppError } from "../utils/AppError";

export class ChatController {
  static async createChat(req: Request, res: Response): Promise<void> {
    const { participantIds, chatType } = req.body;
    const userId = AuthUtils.getUserId(req);

    const chat = await ChatService.findOrCreateChat(userId, {
      participantIds: participantIds.map(
        (id: string) => new Types.ObjectId(id)
      ),
      chatType,
    });

    res.status(201).json(chat);
  }

  static async getChats(req: Request, res: Response): Promise<void> {
    const { page = "1", limit = "20" } = req.query;
    const userId = AuthUtils.getUserId(req);

    const chats = await ChatService.getUserChats(
      userId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(chats);
  }

  static async sendMessage(req: Request, res: Response): Promise<void> {
    const { chatId, text, attachments, replyTo } = req.body;
    const userId = AuthUtils.getUserId(req);

    const message = await ChatService.sendMessage(userId, {
      chatId: new Types.ObjectId(chatId as string),
      text,
      attachments,
      replyTo: replyTo ? new Types.ObjectId(replyTo as string) : undefined,
    });

    res.status(201).json(message);
  }

  static async getMessages(req: Request, res: Response): Promise<void> {
    const { chatId } = req.params;
    const { page = "1", limit = "50" } = req.query;
    const userId = AuthUtils.getUserId(req);

    const messages = await ChatService.getChatMessages(
      new Types.ObjectId(chatId),
      userId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(messages);
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    const { chatId } = req.params;
    const userId = AuthUtils.getUserId(req);

    await ChatService.markAsRead(new Types.ObjectId(chatId), userId);

    res.json({ message: "Messages marked as read" });
  }

  static async deleteMessage(req: Request, res: Response): Promise<void> {
    const { messageId } = req.params;
    const userId = AuthUtils.getUserId(req);

    await ChatService.deleteMessage(new Types.ObjectId(messageId), userId);

    res.json({ message: "Message deleted successfully" });
  }

  static async getChat(req: Request, res: Response): Promise<void> {
    const { chatId } = req.params;
    const userId = AuthUtils.getUserId(req);

    const chat = await ChatService.getChatById(
      new Types.ObjectId(chatId),
      userId
    );

    res.json(chat);
  }

  static async getDirectChat(req: Request, res: Response): Promise<void> {
    const { userId: otherUserId } = req.params;
    const currentUserId = AuthUtils.getUserId(req);

    const chat = await ChatService.getOrCreateDirectChat(
      currentUserId,
      new Types.ObjectId(otherUserId)
    );

    res.json(chat);
  }
  static async replyToMessage(req: Request, res: Response): Promise<void> {
    const { chatId, text, attachments, replyTo } = req.body;
    const userId = AuthUtils.getUserId(req);

    if (!replyTo) {
      throw new AppError("ReplyTo message ID is required", 400);
    }

    const message = await ChatService.replyToMessage(userId, {
      chatId: new Types.ObjectId(chatId),
      text,
      attachments,
      replyTo: new Types.ObjectId(replyTo),
    });

    res.status(201).json(message);
  }
}
