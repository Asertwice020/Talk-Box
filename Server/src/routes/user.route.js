import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// IMPORTS OF CONTROLLERS METHODS
import {
  registerUser,
  loginUser,
  logoutUser,
  generateNewAccessToken,
  changeCurrentPassword,
  getAllUsers,
  changeUserAvatar,
  removeUserAvatar,
} from "../controllers/user.controller.js";

// --- UN-SECURED ROUTES ---

// 1. REGISTER
router.route("/register").post(upload.single("avatar"), registerUser);

// LOGIN
router.route("/login").post(loginUser);

// --- SECURED ROUTES ---

// LOGOUT
router.route("/logout").get(verifyJWT, logoutUser);

// GET ALL USERS
router.route("/all-users").get(verifyJWT, getAllUsers);

// CHANGE USER AVATAR
router
  .route("/change-avatar")
  .patch(verifyJWT, upload.single("avatar"), changeUserAvatar);

// REMOVE USER AVATAR
router.route("/remove-avatar").patch(verifyJWT, removeUserAvatar);

export { router };