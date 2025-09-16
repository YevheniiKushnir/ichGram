import mongoose, { Document, Schema, Types } from "mongoose";

export interface IChat extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  unreadCounts: { userId: Types.ObjectId; count: number }[];
  chatType: "direct" | "group";
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCounts: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        count: { type: Number, default: 0 },
      },
    ],
    chatType: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ chatType: 1 });

chatSchema.virtual("isGroup").get(function () {
  return this.chatType === "group";
});

export const Chat = mongoose.model<IChat>("Chat", chatSchema);
