import { Request, Response } from "express";
import { PostService } from "../services/postService";
import { Types } from "mongoose";
import { AuthUtils } from "../utils/authUtils";

export class PostController {
  static async createPost(req: Request, res: Response): Promise<void> {
    const userId = AuthUtils.getUserId(req);
    const post = await PostService.createPost(userId, req.body);
    res.status(201).json(post);
  }

  static async getPost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const userId = AuthUtils.getOptionalUserId(req);
    const post = await PostService.getPostById(
      new Types.ObjectId(postId),
      userId
    );

    res.json(post);
  }

  static async getUserPosts(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const { page = "1", limit = "10" } = req.query;
    const currentUserId = AuthUtils.getUserId(req);

    const posts = await PostService.getUserPosts(
      new Types.ObjectId(userId),
      parseInt(page as string),
      parseInt(limit as string),
      currentUserId
    );

    res.json(posts);
  }

  static async likePost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const userId = AuthUtils.getUserId(req);
    await PostService.likePost({ postId: new Types.ObjectId(postId), userId });
    res.json({ message: "Post liked" });
  }

  static async unlikePost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const userId = AuthUtils.getUserId(req);
    await PostService.unlikePost({
      postId: new Types.ObjectId(postId),
      userId,
    });
    res.json({ message: "Post unliked" });
  }

  static async savePost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const userId = AuthUtils.getUserId(req);
    await PostService.savePost({ postId: new Types.ObjectId(postId), userId });
    res.json({ message: "Post saved" });
  }

  static async unsavePost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const userId = AuthUtils.getUserId(req);
    await PostService.unsavePost({
      postId: new Types.ObjectId(postId),
      userId,
    });
    res.json({ message: "Post unsaved" });
  }

  static async updatePost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const userId = AuthUtils.getUserId(req);
    const updatedPost = await PostService.updatePost(
      new Types.ObjectId(postId),
      userId,
      req.body
    );

    res.json(updatedPost);
  }

  static async deletePost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const userId = AuthUtils.getUserId(req);
    await PostService.deletePost({
      postId: new Types.ObjectId(postId),
      userId,
    });

    res.json({ message: "Post deleted" });
  }

  static async explorePosts(req: Request, res: Response): Promise<void> {
    const { page = "1", limit = "10" } = req.query;
    const userId = AuthUtils.getOptionalUserId(req);

    const posts = await PostService.explorePosts(
      parseInt(page as string),
      parseInt(limit as string),
      userId
    );

    res.json(posts);
  }
}
