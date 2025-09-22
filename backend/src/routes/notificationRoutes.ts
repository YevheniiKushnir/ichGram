import express from "express";
import { NotificationController } from "../controllers/notificationController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", NotificationController.getNotifications);
router.get("/unread-count", NotificationController.getUnreadCount);
router.patch("/:notificationId/read", NotificationController.markAsRead);
router.patch("/read-all", NotificationController.markAllAsRead);
router.delete("/:notificationId", NotificationController.deleteNotification);

export default router;
