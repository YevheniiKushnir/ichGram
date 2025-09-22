import { Comment } from "../models/Comment";
import { Post } from "../models/Post";
import { Types } from "mongoose";
import { AppError } from "../utils/AppError";
import {
  CommentWithAuthor,
  CreateCommentData,
  PopulatedComment,
} from "../types/comment";
import { NotificationService } from "./notificationService";

export class CommentService {
  private static mapCommentToResponse = (
    comment: PopulatedComment,
    userId?: Types.ObjectId
  ): CommentWithAuthor => {
    return {
      ...comment,
      likeCount: comment.likeCount,
      isLiked: userId
        ? comment.likes.some((like) => like.equals(userId))
        : false,
    };
  };

  static async createComment(
    authorId: Types.ObjectId,
    commentData: CreateCommentData
  ): Promise<CommentWithAuthor> {
    const { postId, text, parentCommentId } = commentData;

    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        throw new AppError("Parent comment not found", 404);
      }
    }

    const comment = await Comment.create({
      author: authorId,
      post: postId,
      text: text.trim(),
      parentComment: parentCommentId,
    });

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });
    //  INTEGRATION: Notification for the author of the post (if it is not the author themselves)
    if (!post.author.equals(authorId)) {
      await NotificationService.createNotification({
        recipientId: post.author,
        senderId: authorId,
        type: "comment",
        postId: postId,
        commentId: comment._id,
      });
    }
    // INTEGRATION: If this is a reply to a comment, notify the author of the parent comment.
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId).populate(
        "author"
      );
      if (parentComment && !parentComment.author._id.equals(authorId)) {
        await NotificationService.createNotification({
          recipientId: parentComment.author._id,
          senderId: authorId,
          type: "reply",
          postId: postId,
          commentId: comment._id,
        });
      }
    }

    const populatedComment = await Comment.findById(
      comment._id
    ).populate<PopulatedComment>("author", "username fullName avatarUrl");

    if (!populatedComment) {
      throw new AppError("Comment not found after creation", 500);
    }

    return this.mapCommentToResponse(populatedComment);
  }

  static async getPostComments(
    postId: Types.ObjectId,
    page: number = 1,
    limit: number = 20,
    userId?: Types.ObjectId
  ): Promise<CommentWithAuthor[]> {
    const comments = await Comment.find({
      post: postId,
      parentComment: { $exists: false },
    })
      .populate<PopulatedComment>("author", "username fullName avatarUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate<PopulatedComment>("author", "username fullName avatarUrl")
          .limit(5);

        const mappedComment = this.mapCommentToResponse(comment, userId);
        const mappedReplies = replies.map((reply) =>
          this.mapCommentToResponse(reply, userId)
        );

        return {
          ...mappedComment,
          replies: mappedReplies,
        };
      })
    );
  }

  static async likeComment(
    commentId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<void> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    const isAlreadyLiked = comment.likes.some((like) => like.equals(userId));
    if (isAlreadyLiked) {
      throw new AppError("Comment already liked", 400);
    }

    await Comment.findByIdAndUpdate(commentId, {
      $addToSet: { likes: userId },
    });
    //  INTEGRATION: Notification for the author of the comment (if not the author themselves)
    if (!comment.author._id.equals(userId)) {
      await NotificationService.createNotification({
        recipientId: comment.author._id,
        senderId: userId,
        type: "like",
        commentId: commentId,
        postId: comment.post,
      });
    }
  }

  static async unlikeComment(
    commentId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<void> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    const isLiked = comment.likes.some((like) => like.equals(userId));
    if (!isLiked) {
      throw new AppError("Comment not liked", 400);
    }

    await Comment.findByIdAndUpdate(commentId, {
      $pull: { likes: userId },
    });
  }

  static async deleteComment(
    commentId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<void> {
    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      author: userId,
    });

    if (!comment) {
      throw new AppError("Comment not found or access denied", 404);
    }

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    await Comment.deleteMany({ parentComment: commentId });
  }

  static async getCommentReplies(
    commentId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
    userId?: Types.ObjectId
  ): Promise<CommentWithAuthor[]> {
    const replies = await Comment.find({ parentComment: commentId })
      .populate<PopulatedComment>("author", "username fullName avatarUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return replies.map((reply) => this.mapCommentToResponse(reply, userId));
  }
}
