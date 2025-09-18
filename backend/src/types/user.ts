export interface UserProfile {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  isPrivate: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing?: boolean;
  followers?: UserShort[];
  following?: UserShort[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserShort {
  _id: string;
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
  followerId: string;
  followingId: string;
}

export interface PaginationParamsQuery {
  page?: string;
  limit?: string;
}

export interface UserFeedParams {
  userId: string;
  page?: number;
  limit?: number;
}
