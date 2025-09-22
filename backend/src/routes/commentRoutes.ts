import express from "express";
import { CommentController } from "../controllers/commentController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authMiddleware, CommentController.createComment);
router.post("/:commentId/like", authMiddleware, CommentController.likeComment);
router.delete(
  "/:commentId/like",
  authMiddleware,
  CommentController.unlikeComment
);
router.delete("/:commentId", authMiddleware, CommentController.deleteComment);

router.get("/post/:postId", CommentController.getPostComments);
router.get("/:commentId/replies", CommentController.getCommentReplies);

export default router;
