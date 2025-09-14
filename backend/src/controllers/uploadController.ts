import { Request, Response } from 'express';
import { generateSignature } from '../services/сloudinary';

export const getSignature = (req: Request, res: Response) => {
  generateSignature(req, res);
};