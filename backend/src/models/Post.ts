import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPost extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  images: string[];
  caption?: string;
  location?: string;
  tags: string[];
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  saves: Types.ObjectId[];
  isArchived: boolean;
  mentions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    caption: {
      type: String,
      maxlength: 2200,
    },
    location: {
      type: String,
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    saves: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    mentions: [
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

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ caption: "text", tags: "text" });

postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

postSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

postSchema.virtual("saveCount").get(function () {
  return this.saves.length;
});

postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

export const Post = mongoose.model<IPost>("Post", postSchema);
