import { Router } from "express";
import { AuthController } from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

router.post("/refresh", AuthController.refreshToken);

router.post("/logout", authMiddleware, AuthController.logout);

router.post("/logout-all", authMiddleware, AuthController.logoutAll);

export default router;
