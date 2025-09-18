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

export class UserService {
  static async getProfile(
    userId: string,
    requestedById?: string
  ): Promise<UserProfile> {
    const user = await User.findById(userId)
      .select("-password")
      .populate<{ followers: UserShort[]; following: UserShort[] }>([
        { path: "followers", select: "username fullName avatarUrl bio" },
        { path: "following", select: "username fullName avatarUrl bio" },
      ]);

    if (!user) {
      throw new Error("User not found");
    }

    const profile: UserProfile = {
      _id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      website: user.website,
      isPrivate: user.isPrivate,
      followerCount: user.followers.length, // virtual followerCount
      followingCount: user.following.length, // virtual followingCount
      postCount: user.posts.length, // virtual postCount
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // add isFollowind
    if (requestedById) {
      const isFollowing = user.followers.some(
        (follower: UserShort) => follower._id === requestedById
      );
      profile.isFollowing = isFollowing;
    }

    return profile;
  }

  static async searchUsers(
    query: string,
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
      _id: user._id.toString(),
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
    if (followerId === followingId) {
      throw new Error("Cannot follow yourself");
    }

    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(followingId),
    ]);

    if (!follower || !following) {
      throw new Error("User not found");
    }

    const isAlreadyFollowing = follower.following.some(
      (id: Types.ObjectId) => id.toString() === followingId
    );

    if (isAlreadyFollowing) {
      throw new Error("Already following this user");
    }

    follower.following.push(new Types.ObjectId(followingId));
    following.followers.push(new Types.ObjectId(followerId));

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
      throw new Error("User not found");
    }

    follower.following = follower.following.filter(
      (id: Types.ObjectId) => id.toString() !== followingId
    );

    following.followers = following.followers.filter(
      (id: Types.ObjectId) => id.toString() !== followerId
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
      throw new Error("User not found");
    }

    return user.followers.map((follower: UserShort) => ({
      _id: follower._id.toString(),
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
      throw new Error("User not found");
    }

    return user.following.map((following: UserShort) => ({
      _id: following._id.toString(),
      username: following.username,
      fullName: following.fullName,
      avatarUrl: following.avatarUrl,
      bio: following.bio,
    }));
  }

  static async updateProfile(
    userId: string,
    updateData: UserProfileData
  ): Promise<UserProfile> {
    const { fullName, bio, website, avatarUrl, isPrivate } = updateData;
    const user = await User.findByIdAndUpdate(
      userId,
      { fullName, bio, website, avatarUrl, isPrivate },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return {
      _id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      website: user.website,
      isPrivate: user.isPrivate,
      followerCount: user.followers.length,
      followingCount: user.following.length,
      postCount: user.posts.length,
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

    if (!user) throw new Error("User not found");

    const followingIds = user.following.map((f) => f._id);

    const posts = await Post.find({ author: { $in: followingIds } })
      .populate<{ author: UserShort }>("author", "username fullName avatarUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return posts as PostWithAuthor[];
  }
}
