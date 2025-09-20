import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { Types } from "mongoose";
import { AuthUtils } from "../utils/authUtils";

export class UserController {
  static async getMyProfile(req: Request, res: Response): Promise<void> {
    const userId = AuthUtils.getUserId(req);
    const profile = await UserService.getProfile(userId);
    res.json(profile);
  }
  // 1st param = user whose profile we are displaying, 2nd =  current user making the request
  static async getUserProfile(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const reqUserId = AuthUtils.getOptionalUserId(req);
    const profile = await UserService.getProfile(
      new Types.ObjectId(userId),
      reqUserId
    );
    res.json(profile);
  }

  static async searchUsers(req: Request, res: Response): Promise<void> {
    const { q = "", limit = "10" } = req.query;
    const users = await UserService.searchUsers(
      q as string,
      parseInt(limit as string)
    );
    res.json(users);
  }

  static async followUser(req: Request, res: Response): Promise<void> {
    const { userId: followingId } = req.params;
    const reqUserId = AuthUtils.getUserId(req);
    await UserService.followUser({
      followerId: reqUserId,
      followingId: new Types.ObjectId(followingId),
    });
    res.json({ message: "Followed successfully" });
  }

  static async unfollowUser(req: Request, res: Response): Promise<void> {
    const { userId: followingId } = req.params;
    const reqUserId = AuthUtils.getUserId(req);
    await UserService.unfollowUser({
      followerId: reqUserId,
      followingId: new Types.ObjectId(followingId),
    });
    res.json({ message: "Unfollowed successfully" });
  }

  static async getFollowers(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const { page = "1", limit = "20" } = req.query;

    const followers = await UserService.getFollowers({
      userId: new Types.ObjectId(userId),
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json(followers);
  }

  static async getFollowing(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const { page = "1", limit = "20" } = req.query;

    const following = await UserService.getFollowing({
      userId: new Types.ObjectId(userId),
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json(following);
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    const reqUserId = AuthUtils.getUserId(req);
    const updatedProfile = await UserService.updateProfile(reqUserId, req.body);
    res.json(updatedProfile);
  }

  static async getFeed(req: Request, res: Response): Promise<void> {
    const { page = "1", limit = "10" } = req.query;
    const reqUserId = AuthUtils.getUserId(req);

    const feed = await UserService.getFeed({
      userId: reqUserId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json(feed);
  }
}
