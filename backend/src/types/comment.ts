import { UserShort } from "./user";
import { Types } from "mongoose";
import { IComment } from "../models/Comment";

export interface PopulatedComment extends Omit<IComment, "author"> {
  author: UserShort;
}

export interface CommentWithAuthor extends PopulatedComment {
  likeCount: number;
  isLiked?: boolean;
  replies?: CommentWithAuthor[];
}

export interface CreateCommentData {
  postId: Types.ObjectId;
  text: string;
  parentCommentId?: Types.ObjectId;
}

export interface CommentQueryParams {
  page?: number;
  limit?: number;
}
