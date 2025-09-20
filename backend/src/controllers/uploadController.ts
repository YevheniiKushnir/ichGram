import { Request, Response } from "express";
import { CloudinaryService } from "../services/сloudinaryService";
import { AppError } from "../utils/AppError";

export const generateSignature = (req: Request, res: Response) => {
  const data = CloudinaryService.generateSignature();

  if (!data) {
    throw new AppError("Failed to generate signature", 500);
  }

  res.json(data);
};
