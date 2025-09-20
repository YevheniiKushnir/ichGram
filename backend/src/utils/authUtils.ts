import { Request } from "express";
import { AppError } from "./AppError";
import { Types } from "mongoose";

export class AuthUtils {
  static getUserId(req: Request): Types.ObjectId {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }
    return req.user.userId;
  }

  static getOptionalUserId(req: Request): Types.ObjectId | undefined {
    return req.user?.userId;
  }
}
