import { Router } from "express";
import { generateSignature } from "../controllers/uploadController";

const router = Router();

router.get("/signature", generateSignature);

export default router;
