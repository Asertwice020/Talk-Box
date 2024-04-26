import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

// IMPORTS OF CHAT CONTROLLER METHODS
import {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
} from "../controllers/chat.controller.js";

// --- SECURED ROUTES ---

// ACCESS
router.route("/").post(verifyJWT, accessChat);

// FETCH
router.route("/").get(verifyJWT, fetchChat);

// GROUP CHAT - CREATION
router.route("/create").post(verifyJWT, createGroupChat);

// GROUP CHAT - RENAME
router.route("/rename").put(verifyJWT, renameGroupChat);

// GROUP CHAT - ADD USER
router.route("/add-user").put(verifyJWT, addToGroupChat);

// // GROUP CHAT - REMOVE USER
router.route("/remove-user").put(verifyJWT, removeFromGroupChat);


export { router }