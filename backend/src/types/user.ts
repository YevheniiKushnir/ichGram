import { Types } from "mongoose";
import { IUser } from "../models/User";

export interface PopulatedUser
  extends Omit<IUser, "password" | "followers" | "following"> {
  followers: UserShort[];
  following: UserShort[];
}

export interface UserProfile extends PopulatedUser {
  isFollowing?: boolean;
}

export interface UserShort {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  isPrivate?: boolean;
  followers?: Types.ObjectId[];
  following?: UserShort[];
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
