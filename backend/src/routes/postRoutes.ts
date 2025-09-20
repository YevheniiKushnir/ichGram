import { Router } from "express";
import { PostController } from "../controllers/postController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Update & delete & create
router.post("/", PostController.createPost);
router.put("/:postId", PostController.updatePost);
router.delete("/:postId", PostController.deletePost);

// get Posts
router.get("/explore", PostController.explorePosts);
router.get("/:postId", PostController.getPost);
router.get("/user/:userId", PostController.getUserPosts);

// Likes & saves
router.post("/:postId/like", PostController.likePost);
router.post("/:postId/unlike", PostController.unlikePost);
router.post("/:postId/save", PostController.savePost);
router.post("/:postId/unsave", PostController.unsavePost);

export default router;
