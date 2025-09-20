// import { Message, IMessage } from "../models/Message";

// export class MessageService {
//   static async deleteForEveryone(messageId: string): Promise<IMessage | null> {
//     return Message.findByIdAndUpdate(
//       messageId,
//       {
//         isDeleted: true,
//         text: undefined,
//         image: undefined,
//       },
//       { new: true }
//     );
//   }

//   static async editMessage(
//     messageId: string,
//     newText: string
//   ): Promise<IMessage | null> {
//     return Message.findByIdAndUpdate(
//       messageId,
//       {
//         text: newText,
//         isEdited: true,
//       },
//       { new: true }
//     );
//   }

//   static async markAsRead(
//     messageId: string,
//     userId: string
//   ): Promise<IMessage | null> {
//     return Message.findByIdAndUpdate(
//       messageId,
//       {
//         $addToSet: { readBy: userId },
//       },
//       { new: true }
//     );
//   }
// }
