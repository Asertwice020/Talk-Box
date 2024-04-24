import { v2 as cloudinary } from "cloudinary";
import { configEnv } from "../configEnv/index.js";
import fs from "fs";
import { ApiError } from "./apiError.util.js";

cloudinary.config({
  cloud_name: configEnv.CLOUDINARY_CLOUD_NAME,
  api_key: configEnv.CLOUDINARY_API_KEY,
  api_secret: configEnv.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // LOG
    const responseObj = {
      fullResponseBody: response,
      responseUrl: response.url,
    };
    // LOG
    console.log("File Has Been Successfully Uploaded!\n", responseObj);

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // remove the locally saved temporary file as the upload operation got failed
    fs.unlinkSync(localFilePath);

    const cloudinaryErrorObj = new ApiError(
      503,
      error?.message ||
      `Facing an issue while connecting to MONGODB :: DB/index.js`,
      "No Tip!",
      error,
      error?.stack
    );
    // LOG
    console.log(cloudinaryErrorObj);
    return null;
  }
};

export { uploadToCloudinary };