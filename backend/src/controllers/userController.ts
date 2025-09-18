import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { AuthRequest } from "../types/auth";
import { getUserId } from "../utils/checkAuth";

export class UserController {
  static async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req as AuthRequest);
      const profile = await UserService.getProfile(userId);
      res.json(profile);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
  // 1st param = user whose profile we are displaying, 2nd =  current user making the request
  static async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const reqUserId = getUserId(req as AuthRequest);
      const profile = await UserService.getProfile(userId, reqUserId);
      res.json(profile);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const statusCode = message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ error: message });
    }
  }

  static async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit } = req.query;
      const users = await UserService.searchUsers(
        q as string,
        parseInt(limit as string) || 10
      );
      res.json(users);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }

  static async followUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId: followingId } = req.params;
      const reqUserId = getUserId(req as AuthRequest);
      await UserService.followUser({
        followerId: reqUserId,
        followingId,
      });
      res.json({ message: "Followed successfully" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const statusCode = message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({ error: message });
    }
  }

  static async unfollowUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId: followingId } = req.params;
      const reqUserId = getUserId(req as AuthRequest);
      await UserService.unfollowUser({
        followerId: reqUserId,
        followingId,
      });
      res.json({ message: "Unfollowed successfully" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const statusCode = message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({ error: message });
    }
  }

  static async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = "1", limit = "20" } = req.query;

      const followers = await UserService.getFollowers({
        userId,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.json(followers);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }

  static async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = "1", limit = "20" } = req.query;

      const following = await UserService.getFollowing({
        userId,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.json(following);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const reqUserId = getUserId(req as AuthRequest);
      const updatedProfile = await UserService.updateProfile(
        reqUserId,
        req.body
      );
      res.json(updatedProfile);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }

  static async getFeed(req: Request, res: Response): Promise<void> {
    try {
      const { page = "1", limit = "10" } = req.query;
      const reqUserId = getUserId(req as AuthRequest);

      const feed = await UserService.getFeed({
        userId: reqUserId,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.json(feed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
}
