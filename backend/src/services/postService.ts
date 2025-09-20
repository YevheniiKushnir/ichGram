import { Post, IPost } from "../models/Post";
import { User } from "../models/User";
import { Types } from "mongoose";
import {
  PostWithAuthor,
  CreatePostData,
  UpdatePostData,
  ReqIdsParams,
} from "../types/post";
import { UserShort } from "../types/user";
import { AppError } from "../utils/AppError";

export class PostService {
  static async createPost(
    authorId: Types.ObjectId,
    postData: CreatePostData
  ): Promise<PostWithAuthor> {
    const post = await Post.create({
      author: authorId,
      images: postData.images,
      caption: postData.caption,
      location: postData.location,
      tags: postData.tags?.map((tag) => tag.toLowerCase()),
    });

    if (!post) {
      throw new AppError("Failed to create a Post", 500);
    }

    await User.findByIdAndUpdate(authorId, {
      $push: { posts: post._id },
    });

    const populatedPost = await Post.findById(post._id).populate<{
      author: UserShort;
    }>("author", "username fullName avatarUrl");

    if (!populatedPost) {
      throw new AppError("Post not found after creation", 500);
    }

    return {
      ...populatedPost,
      _id: populatedPost._id,
      author: populatedPost.author,
      likeCount: populatedPost.likeCount,
      commentCount: populatedPost.commentCount,
      saveCount: populatedPost.saveCount,
    };
  }

  static async getPostById(
    postId: Types.ObjectId,
    userId?: Types.ObjectId
  ): Promise<PostWithAuthor> {
    const post = await Post.findById(postId)
      .populate<{ author: UserShort }>("author", "username fullName avatarUrl")
      .exec();

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const postWithAuthor: PostWithAuthor = {
      ...post,
      _id: post._id,
      author: post.author,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      saveCount: post.saveCount,
    };

    if (userId) {
      postWithAuthor.isLiked = post.likes.some((like) => like.equals(userId));
      postWithAuthor.isSaved = post.saves.some((save) => save.equals(userId));
    }

    return postWithAuthor;
  }

  static async getUserPosts(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
    currentUserId?: Types.ObjectId
  ): Promise<PostWithAuthor[]> {
    const posts = await Post.find({ author: userId })
      .populate<{ author: UserShort }>("author", "username fullName avatarUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return posts.map((post) => ({
      ...post,
      _id: post._id,
      author: post.author,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      saveCount: post.saveCount,
      isLiked: currentUserId
        ? post.likes.some((like) => like.equals(currentUserId))
        : false,
      isSaved: currentUserId
        ? post.saves.some((save) => save.equals(currentUserId))
        : false,
    }));
  }

  static async likePost({ postId, userId }: ReqIdsParams): Promise<void> {
    await Post.findByIdAndUpdate(postId, {
      $addToSet: { likes: userId },
    });
  }

  static async unlikePost({ postId, userId }: ReqIdsParams): Promise<void> {
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: userId },
    });
  }

  static async savePost({ postId, userId }: ReqIdsParams): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedPosts: postId },
    });
  }

  static async unsavePost({ postId, userId }: ReqIdsParams): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { savedPosts: postId },
    });
  }

  static async updatePost(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    updateData: UpdatePostData
  ): Promise<PostWithAuthor> {
    const post = await Post.findOneAndUpdate(
      {
        _id: postId,
        author: userId,
      },
      {
        caption: updateData.caption,
        location: updateData.location,
        tags: updateData.tags?.map((tag) => tag.toLowerCase()),
      },
      { new: true, runValidators: true }
    ).populate<{ author: UserShort }>("author", "username fullName avatarUrl");

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    return {
      ...post,
      _id: post._id,
      author: post.author,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      saveCount: post.saveCount,
    };
  }

  static async deletePost({ postId, userId }: ReqIdsParams): Promise<void> {
    const result = await Post.findOneAndDelete({
      _id: postId,
      author: userId,
    });

    if (!result) {
      throw new AppError("Post not found", 404);
    }
    await User.findByIdAndUpdate(userId, {
      $pull: { posts: postId },
    });
  }

  static async explorePosts(
    page: number = 1,
    limit: number = 10,
    userId?: Types.ObjectId
  ): Promise<PostWithAuthor[]> {
    const posts = await Post.find()
      .populate<{ author: UserShort }>("author", "username fullName avatarUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return posts.map((post) => ({
      ...post,
      _id: post._id,
      author: post.author,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      saveCount: post.saveCount,
      isLiked: userId ? post.likes.some((like) => like.equals(userId)) : false,
      isSaved: userId ? post.saves.some((save) => save.equals(userId)) : false,
    }));
  }
}
