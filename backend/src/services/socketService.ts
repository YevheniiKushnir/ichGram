import { Server } from "socket.io";
import { MessageWithSender } from "../types/chat";

class SocketService {
  private static io: Server;

  static initialize(io: Server) {
    this.io = io;
  }

  static emitToChat(chatId: string, event: string, data: any) {
    if (!this.io) {
      console.error("Socket.io not initialized");
      return;
    }

    try {
      this.io.to(chatId).emit(event, data);
    } catch (error) {
      console.error(`Error emitting ${event} to chat ${chatId}:`, error);
    }
  }

  static emitNewMessage(chatId: string, message: MessageWithSender) {
    this.emitToChat(chatId, "new-message", message);
  }

  static emitMessageRead(
    chatId: string,
    data: { userId: string; timestamp: Date }
  ) {
    this.emitToChat(chatId, "messages-read", data);
  }

  static emitUserTyping(
    chatId: string,
    data: { userId: string; isTyping: boolean }
  ) {
    this.emitToChat(chatId, "user-typing", data);
  }
}

export { SocketService };
