import { Post } from "../models/Post";
import { User } from "../models/User";
import { Types } from "mongoose";
import {
  PostWithAuthor,
  CreatePostData,
  UpdatePostData,
  ReqIdsParams,
  PopulatedPost,
} from "../types/post";
import { UserShort } from "../types/user";
import { AppError } from "../utils/AppError";
import { NotificationService } from "./notificationService";

export class PostService {
  static mapPostToResponse = (
    post: PopulatedPost,
    userId?: Types.ObjectId
  ): PostWithAuthor => {
    return {
      ...post,

      likeCount: post.likeCount,
      commentCount: post.commentCount,
      saveCount: post.saveCount,

      isLiked: userId ? post.likes.some((like) => like.equals(userId)) : false,
      isSaved: userId ? post.saves.some((save) => save.equals(userId)) : false,
    };
  };

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

    return this.mapPostToResponse(populatedPost);
  }

  static async getPostById(
    postId: Types.ObjectId,
    userId?: Types.ObjectId
  ): Promise<PostWithAuthor> {
    const post = await Post.findById(postId).populate<{ author: UserShort }>(
      "author",
      "username fullName avatarUrl"
    );

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (
      post.author.isPrivate &&
      (!userId || !post.author.followers?.includes(userId))
    ) {
      throw new AppError("Cannot view private post", 403);
    }

    return this.mapPostToResponse(post, userId);
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

    return posts.map((post) => this.mapPostToResponse(post, currentUserId));
  }

  static async likePost({ postId, userId }: ReqIdsParams): Promise<void> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const isAlreadyLiked = post.likes.some((like) => like.equals(userId));
    if (isAlreadyLiked) {
      throw new AppError("Post already liked", 400);
    }

    await Post.findByIdAndUpdate(postId, {
      $addToSet: { likes: userId },
    });
    // INTEGRATION: Notification for the author of the post (if it is not the author themselves)
    if (!post.author.equals(userId)) {
      await NotificationService.createNotification({
        recipientId: post.author,
        senderId: userId,
        type: "like",
        postId: postId,
      });
    }
  }

  static async unlikePost({ postId, userId }: ReqIdsParams): Promise<void> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const isLiked = post.likes.some((like) => like.equals(userId));
    if (!isLiked) {
      throw new AppError("Post not liked", 400);
    }

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

    return this.mapPostToResponse(post, userId);
  }

  static async explorePosts(
    page: number = 1,
    limit: number = 10,
    userId?: Types.ObjectId
  ): Promise<PostWithAuthor[]> {
    // Recommendation algorithm
    let query = Post.find();

    // If there is a user, we show posts not from their subscriptions.
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        query = query.where("author").nin([userId, ...user.following]);
      }
    }

    const posts = await query
      .populate<{ author: UserShort }>(
        "author",
        "username fullName avatarUrl isPrivate followers"
      )
      .sort({ likes: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return posts.map((post) => this.mapPostToResponse(post, userId));
  }
}
