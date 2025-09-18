import { AuthRequest } from "../types/auth";

export const getUserId = (req: AuthRequest): string => {
  if (!req.user?.userId) {
    throw new Error("Authentication required");
  }
  return req.user.userId;
};