import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

import {
  sendMessage,
  fetchAllMessages,
} from "../controllers/message.controller.js";

// --- SECURED ROUTES ---

// SEND MESSAGE
router.route("/").post(verifyJWT, sendMessage);

// FETCH ALL MESSAGES
router.route("/:chatId").get(verifyJWT, fetchAllMessages);

export {router}