import { Types } from "mongoose";

export interface UserProfile {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  isPrivate: boolean;

  isFollowing?: boolean;
  followers?: UserShort[];
  following?: UserShort[];
  createdAt: Date;
  updatedAt: Date;

  followerCount: number;
  followingCount: number;
  postCount: number;
}

export interface UserShort {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
}

export interface UserProfileData {
  fullName?: string;
  bio?: string;
  website?: string;
  avatarUrl?: string;
  isPrivate?: boolean;
}

//follow/unfollow
export interface FollowAction {
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
}

export interface PaginationParamsQuery {
  page?: string;
  limit?: string;
}

export interface UserFeedParams {
  userId: Types.ObjectId;
  page?: number;
  limit?: number;
}
