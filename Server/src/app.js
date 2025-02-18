import express from "express";
import { configEnv } from "./configEnv/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({ origin: configEnv.CLIENT_CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ROUTES IMPORTS - WITH CUSTOM NAMES TO BEING ACCOUNTABLE
import { router as userRoute } from "./routes/user.route.js";
import { router as chatRoute } from "./routes/chat.route.js"
import { router as messageRoute } from "./routes/message.route.js"

app.use("/api/v1/users", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/message", messageRoute);

export { app };