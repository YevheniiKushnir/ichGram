import { Router } from "express";
import { ChatController } from "../controllers/chatController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/", ChatController.createChat);
router.get("/", ChatController.getChats);
router.get("/:chatId", ChatController.getChat);
router.get("/direct/:userId", ChatController.getDirectChat);
router.post("/message", ChatController.sendMessage);
router.get("/:chatId/messages", ChatController.getMessages);
router.patch("/:chatId/read", ChatController.markAsRead);
router.delete("/message/:messageId", ChatController.deleteMessage);
router.post("/message/reply", ChatController.replyToMessage);

export default router;
