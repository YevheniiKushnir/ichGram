export interface AuthResponse {
  user: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email?: string;
  username?: string; 
  password: string;
  deviceId?: string;
  userAgent?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}
