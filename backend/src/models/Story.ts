import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStory extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  image: string;
  video?: string;
  caption?: string;
  expiresAt: Date;
  views: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    video: {
      type: String,
    },
    caption: {
      type: String,
      maxlength: 150,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index for auto-deletion
    },
    views: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });

export const Story = mongoose.model<IStory>("Story", storySchema);
