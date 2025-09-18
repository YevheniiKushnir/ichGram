import { Router } from "express";
import { UserController } from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Profiles
router.get("/profile", UserController.getMyProfile);
router.get("/profile/:userId", UserController.getUserProfile);
router.put("/profile", UserController.updateProfile);

router.get("/search", UserController.searchUsers);

// Followers
router.post("/follow/:userId", UserController.followUser);
router.post("/unfollow/:userId", UserController.unfollowUser);
router.get("/:userId/followers", UserController.getFollowers);
router.get("/:userId/following", UserController.getFollowing);

// Feed
router.get("/feed", UserController.getFeed);

export default router;
