import { Request } from "express";
import { UserShort } from "./user";

export interface AuthRequest extends Request {
  user: {
    userId: string;
  };
}

export interface AuthResponse {
  user: UserShort & { email: string };
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
