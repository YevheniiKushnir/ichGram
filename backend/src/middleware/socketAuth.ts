import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Types } from "mongoose";

export interface AuthenticatedSocket extends Socket {
  userId?: Types.ObjectId;
}

export const socketAuthMiddleware = async (socket: AuthenticatedSocket, next: any) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET!) as { userId: string };
    socket.userId = new Types.ObjectId(decoded.userId);
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
};