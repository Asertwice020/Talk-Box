  import { v2 as cloudinary } from "cloudinary";
  import { configEnv } from "../configEnv/index.js";
  import fs from "fs";
  import { ApiError } from "./apiError.util.js";
  import { constantValues } from "../constants.js";

  cloudinary.config({
    cloud_name: configEnv.CLOUDINARY_CLOUD_NAME,
    api_key: configEnv.CLOUDINARY_API_KEY,
    api_secret: configEnv.CLOUDINARY_API_SECRET,
  });

  const uploadToCloudinary = async (localFilePath) => {
    try {
      if (!localFilePath) {
        throw new ApiError(
          400, "File Path Is Missing!"
        )
      }
      const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto", folder: constantValues.TALKBOX_USERS_AVATAR_FOLDER });

      // LOG
      console.log("File Has Been Successfully Uploaded On Cloudinary😎\n", {
        fullResponseBody: response,
      });
    
      // DELETION: REMOVING LOCAL SAVED TEMPORARY FILES
      fs.unlinkSync(localFilePath);
      return response;
    } catch (error) {
      // LOG
      console.log({
        codeFlow:
          'Your Code Flow Is Changed "registerUser-controller" to cloudinary util catch-part...',
        runningOperation: `${localFilePath} is deleting from the server temp folder...`,
      });
      // DELETION: REMOVING LOCAL SAVED TEMPORARY FILES
      fs.unlinkSync(localFilePath);
      console.log(
        `${localFilePath} Has Been Removed From The Server-Temp-Folder Successfully😎`
      );
      throw new ApiError(
        503,
        error?.message || `Cloudinary Service Unavailable!`,
        "No Tip!",
        error,
        error?.stack
      );
    }
  };

  const deleteFromCloudinary = async (oldAvatarUrl) => {
    try {
      if (!oldAvatarUrl) {
        throw new ApiError(400, "Old Avatar Is Missing!");
      }

      // EXTRACT PUBLIC ID - ENSURE PROPER HANDLING OF FOLDER STRUCTURE
      const publicId = oldAvatarUrl.split("/").slice(-2).join("/").split(".").shift()

      const deletionResult = await cloudinary.uploader.destroy(publicId);

      if (deletionResult.result !== "ok") {
        const error = new Error("Failed To Delete Old Avatar From Cloudinary!");

        // MAP CLOUDINARY ERROR CODES TO SPECIFIC MESSAGES
        console.log({ cloudinaryErrorCodes: deletionResult.error?.code });
        switch (deletionResult.error?.code) {
          case "not found" || "not_found":
            error.message = "The specified avatar was not found in Cloudinary.";
            break;
          case "invalid param" || "invalid_param":
            error.message = "Invalid public ID format provided for deletion.";
            break;
          case "unauthorized":
            error.message = "Unauthorized access to delete the avatar.";
            break;
          default:
            // DEFAULT ERROR
            error.message = `Cloudinary deletion error: ${deletionResult.error?.message}`;
        }
        throw error;
      }

      return true;
    } catch (error) {
      // LOG
      console.log({
        codeFlow: 'Your Code Flow Is Changed "Removed/ChangeUserAvatar-controller" to "DeleteAvatarFromCloudinary" util catch-part...',
      });
      throw new ApiError(
        500,
        error?.message || "Failed To Delete Old Avatar From Cloudinary!",
        "No Tip!",
        error,
        error?.stack
      );
    }
  }

  export { uploadToCloudinary, deleteFromCloudinary };