import mongoose, { Document, Schema, Types } from "mongoose";

export interface IComment extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  post: Types.ObjectId;
  text: string;
  likes: Types.ObjectId[];
  parentComment?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
}

const commentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

commentSchema.pre("save", function (next) {
  if (this.text.trim().length < 1) {
    return next(new Error("Comment cannot be empty"));
  }

  next();
});

commentSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

commentSchema.set("toJSON", { virtuals: true });
commentSchema.set("toObject", { virtuals: true });

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
