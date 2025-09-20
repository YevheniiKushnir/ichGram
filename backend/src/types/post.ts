import { IPost } from "../models/Post";
import { UserShort } from "./user";
import { Types } from "mongoose";

export interface PostWithAuthor extends Omit<IPost, "author"> {
  _id: Types.ObjectId;
  author: UserShort;

  isLiked?: boolean;
  isSaved?: boolean;

  likeCount: number;
  commentCount: number;
  saveCount: number;
}

export interface CreatePostData {
  images: string[];
  caption?: string;
  location?: string;
  tags?: string[];
}

export interface UpdatePostData {
  caption?: string;
  location?: string;
  tags?: string[];
}

export interface PostQueryParams {
  page?: number;
  limit?: number;
}

export interface ReqIdsParams {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
}
