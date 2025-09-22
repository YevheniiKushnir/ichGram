import { Server } from "socket.io";
import {
  AuthenticatedSocket,
  socketAuthMiddleware,
} from "../../middleware/socketAuth";
import { ChatService } from "../../services/chatService";
import { Types } from "mongoose";
import { SocketService } from "../../services/socketService";

interface SendMessageData {
  chatId: string;
  text?: string;
  attachments?: {
    type: "image" | "video" | "file";
    url: string;
    filename?: string;
    size?: number;
  }[];
  replyTo?: string;
}

interface TypingData {
  chatId: string;
  isTyping: boolean;
}

interface JoinChatData {
  chatId: string;
}

export const setupSocketHandlers = (io: Server) => {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    socket.on("join-chat", async (data: JoinChatData) => {
      try {
        const chat = await ChatService.getChatById(
          new Types.ObjectId(data.chatId),
          socket.userId!
        );

        socket.join(data.chatId);
        socket.emit("chat-joined", { chatId: data.chatId });
      } catch (error) {
        socket.emit("error", { message: "Cannot join chat" });
      }
    });

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(chatId);
    });

    socket.on("send-message", async (data: SendMessageData) => {
      try {
        if (!data.chatId || (!data.text && !data.attachments?.length)) {
          socket.emit("error", { message: "Invalid message data" });
          return;
        }
        
        await ChatService.sendMessage(socket.userId!, {
          chatId: new Types.ObjectId(data.chatId),
          text: data.text,
          attachments: data.attachments,
          replyTo: data.replyTo ? new Types.ObjectId(data.replyTo) : undefined,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("mark-as-read", async (chatId: string) => {
      try {
        await ChatService.markAsRead(
          new Types.ObjectId(chatId),
          socket.userId!
        );
      } catch (error) {
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    socket.on("typing", (data: TypingData) => {
      SocketService.emitUserTyping(data.chatId, {
        userId: socket.userId!.toString(),
        isTyping: data.isTyping,
      });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};
