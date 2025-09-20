import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { Types } from "mongoose";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    throw new AppError("Access token required", 401);
  }

  const decoded = jwt.verify(token, env.JWT_SECRET!) as { userId: string };
  req.user = {
    userId: new Types.ObjectId(decoded.userId),
  };
  next();
};

export default authMiddleware;
