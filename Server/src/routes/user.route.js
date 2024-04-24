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
} from "../controllers/user.controller.js";

// --- UN-SECURED ROUTES ---

// 1. REGISTER
router.route("/register").post(upload.single("avatar"), registerUser);

// LOGIN
router.route("/login").post(loginUser);

// --- SECURED ROUTES ---

// LOGOUT
router.route("/logout").get(verifyJWT, logoutUser);


export { router };
