import { User, IUser } from "../models/User";
import { Post } from "../models/Post";
import { Types } from "mongoose";
import {
  UserProfile,
  UserShort,
  UserProfileData,
  FollowAction,
  UserFeedParams,
  PopulatedUser,
} from "../types/user";
import { PostWithAuthor } from "../types/post";
import { AppError } from "../utils/AppError";
import { PostService } from "./postService";
import { NotificationService } from "./notificationService";

export class UserService {
  private static mapUserToShort = (user: IUser): UserShort => ({
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    isPrivate: user.isPrivate,
  });

  private static mapUserToProfile = (
    user: PopulatedUser,
    requestedById?: Types.ObjectId
  ): UserProfile => {
    const profile: UserProfile = {
      ...user,
      isFollowing: requestedById
        ? user.followers.some((follower) => follower._id.equals(requestedById))
        : undefined,
    };

    return profile;
  };

  static async getProfile(
    userId: Types.ObjectId,
    requestedById?: Types.ObjectId
  ): Promise<UserProfile> {
    const user = await User.findById(userId)
      .select("-password")
      .populate<PopulatedUser>([
        {
          path: "followers",
          select: "username fullName avatarUrl bio",
          match: requestedById ? { _id: requestedById } : {},
        },
        {
          path: "following",
          select: "username fullName avatarUrl bio",
        },
      ]);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return this.mapUserToProfile(user, requestedById);
  }

  static async searchUsers(
    query: string = "",
    limit: number = 10
  ): Promise<UserShort[]> {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
      ],
    })
      .select("username fullName avatarUrl bio isPrivate")
      .limit(limit);

    return users.map((user) => this.mapUserToShort(user));
  }

  static async followUser({
    followerId,
    followingId,
  }: FollowAction): Promise<void> {
    if (followerId.equals(followingId)) {
      throw new AppError("Cannot follow yourself", 403);
    }

    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(followingId),
    ]);

    if (!follower || !following) {
      throw new AppError("User not found", 404);
    }

    const isAlreadyFollowing = follower.following.some((id) =>
      id.equals(followingId)
    );

    if (isAlreadyFollowing) {
      throw new AppError("Already following this user", 403);
    }

    follower.following.push(followingId);
    following.followers.push(followerId);

    await Promise.all([follower.save(), following.save()]);
    //  INTEGRATION: Notification of new subscription
    await NotificationService.createNotification({
      recipientId: followingId,
      senderId: followerId,
      type: "follow",
    });
  }

  static async unfollowUser({
    followerId,
    followingId,
  }: FollowAction): Promise<void> {
    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(followingId),
    ]);

    if (!follower || !following) {
      throw new AppError("User not found", 404);
    }

    follower.following = follower.following.filter(
      (id) => !id.equals(followingId)
    );

    following.followers = following.followers.filter(
      (id) => !id.equals(followerId)
    );

    await Promise.all([follower.save(), following.save()]);
  }

  static async getFollowers({
    userId,
    page = 1,
    limit = 20,
  }: UserFeedParams): Promise<UserShort[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const followers = await User.find({ _id: { $in: user.followers } })
      .select("username fullName avatarUrl bio isPrivate")
      .skip((page - 1) * limit)
      .limit(limit);

    return followers.map((follower) => this.mapUserToShort(follower));
  }

  static async getFollowing({
    userId,
    page = 1,
    limit = 20,
  }: UserFeedParams): Promise<UserShort[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const following = await User.find({ _id: { $in: user.following } })
      .select("username fullName avatarUrl bio isPrivate")
      .skip((page - 1) * limit)
      .limit(limit);

    return following.map((user) => this.mapUserToShort(user));
  }

  static async updateProfile(
    userId: Types.ObjectId,
    updateData: UserProfileData
  ): Promise<UserProfile> {
    const { fullName, bio, website, avatarUrl, isPrivate } = updateData;

    const user = await User.findByIdAndUpdate(
      userId,
      { fullName, bio, website, avatarUrl, isPrivate },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate<PopulatedUser>([
        { path: "followers", select: "username fullName avatarUrl bio" },
        { path: "following", select: "username fullName avatarUrl bio" },
      ]);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return this.mapUserToProfile(user);
  }

  static async getFeed({
    userId,
    page = 1,
    limit = 10,
  }: UserFeedParams): Promise<PostWithAuthor[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const posts = await Post.find({ author: { $in: user.following } })
      .populate<{ author: UserShort }>("author", "username fullName avatarUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return posts.map((post) => PostService.mapPostToResponse(post, userId));
  }
}
