import mongoose, { Document, Schema, Types } from "mongoose";

export interface IResetToken extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const resetTokenSchema = new Schema<IResetToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

resetTokenSchema.index({ token: 1 });
resetTokenSchema.index({ userId: 1 });
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ResetToken = mongoose.model<IResetToken>("ResetToken", resetTokenSchema);