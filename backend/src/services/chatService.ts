// import { Chat } from "../models/Chat";
// import { Types } from "mongoose";

// export class ChatService {
//   static async incrementUnread(chatId: string): Promise<void> {
//     await Chat.findByIdAndUpdate(new Types.ObjectId(chatId), {
//       $inc: { unreadCount: 1 },
//     });
//   }

//   static async resetUnread(chatId: string): Promise<void> {
//     await Chat.findByIdAndUpdate(new Types.ObjectId(chatId), {
//       unreadCount: 0,
//     });
//   }

//   static async getUnreadCount(userId: string): Promise<number> {
//     const chats = await Chat.find({ participants: new Types.ObjectId(userId) });
//     return chats.reduce((total, chat) => total + chat.unreadCount, 0);
//   }

//   static async findOrCreateChat(
//     participant1: string,
//     participant2: string
//   ): Promise<any> {
//     const chats = await Chat.find({
//       participants: {
//         $all: [
//           new Types.ObjectId(participant1),
//           new Types.ObjectId(participant2),
//         ],
//       },
//     });

//     if (chats.length > 0) return chats[0];

//     return Chat.create({
//       participants: [
//         new Types.ObjectId(participant1),
//         new Types.ObjectId(participant2),
//       ],
//       unreadCount: 0,
//     });
//   }
// }
