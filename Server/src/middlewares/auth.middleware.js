import { ApiError } from "../utils/apiError.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import jwt from "jsonwebtoken";
import { configEnv } from "../configEnv/index.js";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler( async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request", "No tips");
    }

    const decodedToken = jwt.verify(token, configEnv.ACCESS_TOKEN_SECRET);

    if(!decodedToken) {
      throw new ApiError(401, "Unauthorized request", "No tips");
    }

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token", "No tips");
    }

    req.user = user;
    next()
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
})

export { verifyJWT };
