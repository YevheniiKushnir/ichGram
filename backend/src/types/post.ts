import { UserShort } from "../types/user";
import { IPost } from "../models/Post";

export type PostWithAuthor = Omit<IPost, "author"> & {
  author: UserShort;
};