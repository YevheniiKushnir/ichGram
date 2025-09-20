import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

function convertObjectIdToString(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (obj instanceof Types.ObjectId) return obj.toString();

  if (Array.isArray(obj)) return obj.map(convertObjectIdToString);

  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, convertObjectIdToString(v)])
  );
}

const transformResponse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  res.json = (data: any) => originalJson(convertObjectIdToString(data));

  next();
};

export default transformResponse;