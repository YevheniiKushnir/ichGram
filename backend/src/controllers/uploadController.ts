import { Request, Response } from 'express';
import { CloudinaryService } from '../services/сloudinaryService';

export const generateSignature = (req: Request, res: Response) => {
  try {
    const data = CloudinaryService.generateSignature();
    res.json(data);
  } catch (error) {
    console.error("Cloudinary signature error:", error);
    res.status(500).json({ message: "Error generating signature" });
  }
};