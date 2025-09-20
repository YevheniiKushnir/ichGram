import { User, IUser } from "../models/User";
import { Post } from "../models/Post";
import { Types } from "mongoose";
import {
  UserProfile,
  UserShort,
  UserProfileData,
  FollowAction,
  UserFeedParams,
} from "../types/user";
import { PostWithAuthor } from "../types/post";
import { AppError } from "../utils/AppError";

export class UserService {
  static async getProfile(
    userId: Types.ObjectId,
    requestedById?: Types.ObjectId
  ): Promise<UserProfile> {
    const user = await User.findById(userId)
      .select("-password")
      .populate<{ followers: UserShort[]; following: UserShort[] }>([
        { path: "followers", select: "username fullName avatarUrl bio" },
        { path: "following", select: "username fullName avatarUrl bio" },
      ]);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const profile: UserProfile = {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      website: user.website,
      isPrivate: user.isPrivate,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      postCount: user.postCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // add isFollowind
    if (requestedById) {
      const isFollowing = user.followers.some((follower: UserShort) =>
        follower._id.equals(requestedById)
      );
      profile.isFollowing = isFollowing;
    }

    return profile;
  }

  static async searchUsers(
    query: string = "",
    limit: number = 10
  ): Promise<UserShort[]> {
    const users = await User.find({
      $or: [
        { username: { $regex: `.*${query}.*`, $options: "i" } },
        { fullName: { $regex: `.*${query}.*`, $options: "i" } },
      ],
    })
      .select("username fullName avatarUrl bio followers")
      .limit(limit);

    return users.map((user) => ({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    }));
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
    const user = await User.findById(userId).populate<{
      followers: UserShort[];
    }>({
      path: "followers",
      select: "username fullName avatarUrl bio",
      options: {
        skip: (page - 1) * limit,
        limit: limit,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user.followers.map((follower) => ({
      _id: follower._id,
      username: follower.username,
      fullName: follower.fullName,
      avatarUrl: follower.avatarUrl,
      bio: follower.bio,
    }));
  }

  static async getFollowing({
    userId,
    page = 1,
    limit = 20,
  }: UserFeedParams): Promise<UserShort[]> {
    const user = await User.findById(userId).populate<{
      following: UserShort[];
    }>({
      path: "following",
      select: "username fullName avatarUrl bio",
      options: {
        skip: (page - 1) * limit,
        limit: limit,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user.following.map((following: UserShort) => ({
      _id: following._id,
      username: following.username,
      fullName: following.fullName,
      avatarUrl: following.avatarUrl,
      bio: following.bio,
    }));
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
    ).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      website: user.website,
      isPrivate: user.isPrivate,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      postCount: user.postCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Feed = posts from following users
  static async getFeed({
    userId,
    page = 1,
    limit = 10,
  }: UserFeedParams): Promise<PostWithAuthor[]> {
    const user = await User.findById(userId).populate<{
      following: UserShort[];
    }>("following");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const followingIds = user.following.map((f) => f._id);

    const posts = await Post.find({ author: { $in: followingIds } })
      .populate<{ author: UserShort }>("author", "username fullName avatarUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return posts.map((post) => {
      return {
        ...post,
        _id: post._id,
        author: post.author,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        saveCount: post.saveCount,
        isLiked: post.likes.some((like) => like.equals(userId)),
        isSaved: post.saves.some((save) => save.equals(userId)),
      };
    });
  }
}
