import { UserShort } from "./user";
import { Types } from "mongoose";
import { IPost } from "../models/Post";

export interface PopulatedPost extends Omit<IPost, "author" | "_id"> {
  author: UserShort;
  _id: Types.ObjectId;
}

export interface PostWithAuthor extends PopulatedPost {
  images: string[];
  caption?: string;
  location?: string;
  tags: string[];
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  saves: Types.ObjectId[];
  isArchived: boolean;
  mentions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;

  likeCount: number;
  commentCount: number;
  saveCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
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
