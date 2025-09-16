import { Request } from 'express';

export interface AuthUser {
  userId: string;
}

export interface AuthRequest extends Request {
  user: AuthUser;
}