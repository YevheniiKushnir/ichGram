import { Request, Response } from "express";
import { Types } from "mongoose";
import { CommentService } from "../services/commentService";
import { AuthUtils } from "../utils/authUtils";
import { AppError } from "../utils/AppError";

export class CommentController {
  static async createComment(req: Request, res: Response): Promise<void> {
    const { postId, text, parentCommentId } = req.body;
    const authorId = AuthUtils.getUserId(req);

    if (!Types.ObjectId.isValid(postId)) {
      throw new AppError("Invalid post ID", 400);
    }

    const comment = await CommentService.createComment(authorId, {
      postId: new Types.ObjectId(postId as string),
      text,
      parentCommentId: parentCommentId
        ? new Types.ObjectId(parentCommentId as string)
        : undefined,
    });

    res.status(201).json(comment);
  }

  static async getPostComments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const { page = "1", limit = "20" } = req.query;
    const userId = AuthUtils.getOptionalUserId(req);

    const comments = await CommentService.getPostComments(
      new Types.ObjectId(postId),
      parseInt(page as string),
      parseInt(limit as string),
      userId
    );

    res.json(comments);
  }

  static async likeComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const userId = AuthUtils.getUserId(req);

    await CommentService.likeComment(new Types.ObjectId(commentId), userId);
    res.json({ message: "Comment liked successfully" });
  }

  static async unlikeComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const userId = AuthUtils.getUserId(req);

    await CommentService.unlikeComment(new Types.ObjectId(commentId), userId);
    res.json({ message: "Comment unliked successfully" });
  }

  static async deleteComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const userId = AuthUtils.getUserId(req);

    await CommentService.deleteComment(new Types.ObjectId(commentId), userId);
    res.json({ message: "Comment deleted successfully" });
  }

  static async getCommentReplies(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const { page = "1", limit = "10" } = req.query;
    const userId = AuthUtils.getOptionalUserId(req);

    const replies = await CommentService.getCommentReplies(
      new Types.ObjectId(commentId),
      parseInt(page as string),
      parseInt(limit as string),
      userId
    );

    res.json(replies);
  }
}
