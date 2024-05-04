import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.util.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import { constantValues } from "../constants.js";
import { error } from "console";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Failed To Generating Access And Refresh Tokens!",
      error,
      error?.stack
    );
  }
};

// SETTING COOKIES OPTIONS SO, USER CAN'T MODIFY THESE ON THE FRONTEND SIDE, IT ONLY CAN BE MODIFIED BY SERVER SIDE. ALTHOUGH COOKIES VISIBLE TO USER [IF USER CAN FIND IT, BUT UNABLE TO MODIFY]
const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
  let avatarLocalPath;
  try {
    // 1. EXTRACTION: REGISTRATION DETAILS FROM REQ-BODY
    const { userName, fullName, email, password } = req.body;

    // 2: EXTRACTION: AVATAR ( IF EXISTS )
    if (req?.file && req?.file?.path && req?.file instanceof Object) {
      avatarLocalPath = req.file.path;
    }

    // 3. VALIDATOR: ALL FIELDS ARE REQUIRED
    const emptyFieldsValidation = [userName, fullName, email, password].some(
      (field) => !field || field.trim().length === 0
    );

    if (emptyFieldsValidation) {
      throw new ApiError(400, "All Fields Are Required!");
    }

    // 4. VALIDATOR: USERNAME CONVENTION
    const userNameRegex = /^[a-zA-Z0-9._-]+$/;

    if (!userNameRegex.test(userName)) {
      throw new ApiError(400, "Invalid Username!");
    }

    // 5. VALIDATOR: FULL-NAME CONVENTION
    const fullNameRegex = /^[a-zA-Z ]+$/;

    if (!fullNameRegex.test(fullName)) {
      throw new ApiError(400, "Invalid Full Name!");
    }

    // 6. VALIDATOR: EMAIL
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email.trim())) {
      throw new ApiError(400, "Invalid Email Address!");
    }

    // 7. VALIDATOR: DOES USER EXISTS ALREADY
    const existedUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (existedUser) {
      throw new ApiError(
        409,
        "User With This Username or Email Already Exists!"
      );
    }

    // 8. UPLOAD: AVATAR ON CLOUDINARY
    let avatar;
    if (avatarLocalPath) {
      avatar = await uploadToCloudinary(avatarLocalPath);
      // YOU DON'T NEED TO ADD EXTRA VALIDATOR TO CHECK: AVATAR GETS THE CORRECT VALUE OR NOT, CAUSE ALREADY WROTE THE LOGIC IF AVATAR GETS ANY ERROR WHILE UPLOADING ON CLOUDINARY. AND IF IT GETS AN ERROR SO THE "avatar" GETS THE OBJECT IN IT. AND THEN THIS ERROR PASSED TO THIS "registerUser" CONTROLLER CATCH PART. AND IT WILL SHOW THAT ERROR WHICH APPROPRIATE MANNER. CAUSE YOU ADD THERE "error?.message"
    }

    // 9. CREATION: USER OBJECT/DOCUMENT IN DB
    const user = await User.create({
      fullName,
      userName: userName.toLowerCase(),
      email,
      // avatar: avatar?.url || constantValues.DEFAULT_AVATAR,
      avatar: avatar?.url,
      password,
    });

    if (!user) {
      throw new ApiError(500, "Failed To Create User Document In DB!");
    }

    // 10. DELETION: REMOVING PASSWORD, REFRESH-TOKEN BEFORE SENDING RESPONSE TO FRONTEND
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(501, "Failed To Create Your Account In DB!");
    }

    // 11. SEND: RESPONSE ON FRONTEND
    return res
      .status(201)
      .json(
        new ApiResponse(200, "Your Account Created Successfully!", createdUser)
      );
  } catch (error) {
    // MONGOOSE-VALIDATOR: VALIDATING ERRORS USING MONGOOSE'S BUILT-IN MSGS
    if (error.name === "ValidationError") {
      console.log({allErrorDotName: error.name})
      const validationErrors = [];
      for (const field in error.errors) {
        validationErrors.push(error.errors[field].message);
      }
      console.log({ validationErrors });
      throw new ApiError(400, validationErrors.join(", "));
    }

    // DELETION: REMOVING AVATAR FROM TEMP FOLDER OF SERVER WHILE AN ERROR OCCURS
    fs.existsSync(avatarLocalPath) && fs.unlinkSync(avatarLocalPath);

    throw new ApiError(
      500,
      error?.message || "Something Went Wrong While Registering The User!",
      error,
      error?.stack
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    // 0. REFINE & FILTER: USER GIVES USER-NAME OR EMAIL TO LOGIN. UPDATE THE REQ-BODY
    const { usernameOrEmail } = req?.body;
    
    if (usernameOrEmail) {
      usernameOrEmail.includes("@")
        ? (req.body.email = usernameOrEmail)
        : (req.body.userName = usernameOrEmail);

    // DELETION: UN-USABLE KEY IN THE REQ-BODY
    "usernameOrEmail" in req.body && delete req.body.usernameOrEmail
    }

    // 1. EXTRACTION: LOGIN DETAILS FROM REQ-BODY
    const { userName, email, password } = req.body;
    console.log(
      {
        userName,
        email,
        password,
      },
    );

    // 2. VALIDATOR: ONE IS REQUIRED -> USERNAME || EMAIL
    if (!(userName || email)) {
      throw new ApiError(400, "UserName or Email Is Required!");
    }

    // 3. FIND: USER IN DB
    const user = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (!user) {
      throw new ApiError(404, "User Does Not Exists!");
    }

    // 4. VALIDATOR: PASSWORD
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(400, "Invalid Password!");
    }

    // 5. GENERATION: ACCESS & REFRESH TOKENS
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // FIXME: UPDATE THE USER OBJECT WITH TOKENS INSTEAD OF MAKING ANOTHER REQUEST TO DB, WHICH YOU ARE DOING RIGHT NOW! [CHECK IT NEEDS A _id OR NOT AND IF NOT SO HOW IT'S WORKING]

    // 7. DELETION: REMOVING PASSWORD, REFRESH-TOKEN BEFORE SENDING RESPONSE TO FRONTEND
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!loggedInUser) {
      throw new ApiError(501, "Failed To Made You Logged In!");
    }

    // 8. SEND: RESPONSE ON FRONTEND
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "User Logged In Successfully!", {
          user: loggedInUser,
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something Went Wrong While Your Logging!",
      error,
      error?.stack
    );
  }
});
// ❌
const logoutUser = asyncHandler(async (req, res) => {
  try {
    // 1. VALIDATOR: LOGGED-IN
    if (!req?.user) {
      throw new ApiError(401, "Unauthorized Request!");
    }

    // 2. DELETION: REMOVING REFRESH-TOKEN FIELD FROM THAT PARTICULAR USER-DOCUMENT
    await User.findByIdAndUpdate(
      req.user._id,
      // DELETION: REMOVING REFRESH TOKEN FIELD FROM DOCUMENT
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, "User Logged Out Successfully!", {}));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while logging out the user!!!",
      "No tips",
      error,
      error?.stack
    );
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    /* EXPLAIN: WHEN YOU QUERY ON THIS ENDPOINT SO IT WILL ASK YOU ANYTHING BY THROUGH YOU WANT TO SEARCH/GET THAT USER, AND YOU WILL GET ALL THE USERS WHICH HAS/HAVE THAT SEARCHED THING IN ITSELF.
      EG: USERNAME, FULL-NAME, EMAIL ETC.
      REAL-EG: /api/v1/users/all-users?search=alex&email=alex doe
      BREAK-DOWN: HERE, YOUR SEARCHED QUERIES ARE:
        1. field: you didn't provide -> value: alex
        2. field: email -> value: alex doe
    */

    // 1. VALIDATOR: QUERY-OBJECT
    if (!req?.query?.search) {
      throw new ApiError(400, "You Didn't Pass Anything To Search!");
    }

    // 2. FIND: DATA BASED ON THE QUERIES
    const data = req.query.search && {
      $or: [
        { userName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    };

    if (!data) {
      throw new ApiError(404, "No Data Founds Based On Your Search!");
    }

    // 3. FIND: USER BASED ON THE COLLECTED DATA
    const users = await User.find(data).find({ _id: { $ne: req?.user?._id } });
    // LOG
    console.log({ users });

    // 4. VALIDATOR: USERS NOT FOUND
    if (!users || users.length) {
      throw new ApiError(404, "No Result Found!");
    }

    // 5. SEND: RESPONSE ON FRONTEND
    return res
      .status(302)
      .json(
        new ApiResponse(302, "Your Requested User Found Successfully!", users)
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while getting your search results!",
      "NO Tips!",
      error,
      error?.stack
    );
  }
});

const generateNewAccessToken = asyncHandler(async (req, res) => {
  // first verify user's access token is expired, if yes, so verify user's refresh token through server, if it's match so run the method which you created for generating both tokens, so now user has both new tokens
  // you can access the accessToken by cookies: req.cookies?.refreshToken || req.body?.refreshToken
  try {
    // 1. EXTRACTION: REFRESH TOKEN
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    // LOG
    // console.log("[BEFORE] req.cookies.refreshToken: ", req.cookies.refreshToken);
    // console.log("[BEFORE] req.cookies.accessToken: ", req.cookies.accessToken);

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Request!");
    }

    // 2. VERIFY: PROVIDED REFRESH TOKEN
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      configEnv.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError(401, "Invalid Refresh Token ID!");
    }

    // 3. FIND: USER IN DB
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token ID!");
    }

    // 4. COMPARE AND VERIFY: PROVIDED TOKEN & FETCHED/DECODED TOKEN
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token Is Either Expired or Used!");
    }

    // 5. GENERATION: ACCESS & REFRESH TOKENS
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // LOG
    // console.log("[AFTER] req.cookies.refreshToken: ", req.cookies?.newRefreshToken );
    // console.log("[AFTER] req.cookies.accessToken: ", req.cookies?.accessToken);

    // 6. SEND: RESPONSE ON FRONTEND
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          "Access & Refreshed Tokens Refreshed Successfully!",
          { accessToken, refreshToken: newRefreshToken }
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Unauthorized Request",
      error,
      error?.stack
    );
  }
});
// ❌
const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    // NOTE => I DON'T KNOW, IN WHICH FORMAT THIS WANTS TO PASS DATA IN THE REQ.BODY
    // LOG
    console.log({
      oldPassword,
      newPassword,
    });

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"));
  } catch (error) {
    throw new ApiError(
      400,
      error?.message ||
        "Something Went Wrong While Changin Your Current Password!! :: user.controller.js/registerUser",
      "1. TIP-1   2. TIP-2",
      error,
      error?.stack
    );
  }
});

const changeUserAvatar = asyncHandler(async (req, res) => {
  let newAvatar;
  try {
    // 1. VALIDATOR & EXTRACTION: AVATAR PROVIDED OR NOT
    let avatarLocalPath;
    if (req?.file && req?.file instanceof Object && req?.file?.path) {
      avatarLocalPath = req.file.path;
    }

    if (!avatarLocalPath) {
      throw new ApiError(400, "You Didn't Provide Avatar!");
    }

    // 2. UPLOAD: AVATAR ON CLOUDINARY
    newAvatar = await uploadToCloudinary(avatarLocalPath);

    // 3. VALIDATOR: AVATAR UPLOADED ON CLOUDINARY
    if (!newAvatar || !newAvatar.url) {
      throw new ApiError(503, "Failed To Upload Your Avatar On Cloudinary!");
    }

    // 4. REPLACE: AVATAR FILED VALUE WITH NEW ONE IN DB
    const user = await User.findByIdAndUpdate(req.user?._id).select("avatar");

    if (!user) {
      throw new ApiError(404, "User Not Found!");
    }

    console.log({userAvatar: user.avatar})

    // 5. DELETION: OLD AVATAR FROM CLOUDINARY ( IF EXISTS )
    // if (user.avatar && user.avatar === constantValues.DEFAULT_AVATAR) {}
    if (!user.avatar) {}
    else {await deleteFromCloudinary(user.avatar)}

    // 6. UPDATION: USER NEW AVATAR IN DB
    user.avatar = newAvatar.url;
    await user.save();

    // 7. VALIDATOR: VERIFY AVATAR REPLACEMENT IN DB
    const updatedUser = await User.findById(req.user?._id).select("avatar");

    if (updatedUser && updatedUser.avatar !== newAvatar.url) {
      throw new ApiError(500, "Avatar Replacement Failed!");
    }

    // 8. SEND: RESPONSE ON FRONTEND
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Your Avatar is changed successfully!",
          updatedUser
        )
      );
  } catch (error) {
    if (newAvatar && newAvatar.url) {
      await deleteFromCloudinary(newAvatar.url);
    }

    throw new ApiError(
      500,
      error?.message || "Unable To Update Your Avatar!!!",
      "1. DON'T FORGOT TO REMOVE OLD IMAGE FROM CLOUDINARY",
      error,
      error?.stack
    );
  }
});

const removeUserAvatar = asyncHandler(async (req, res) => {
  let deletedAvatarUrl;
  try {
    // 1. FETCHING: USER WITH AVATAR FILED ONLY IN DB
    const user = await User.findByIdAndUpdate(req.user._id).select("avatar");

    if (!user) {
      throw new ApiError(404, "User Not Found!");
    }
    
    // 2. DELETION: CURRENT AVATAR FROM CLOUDINARY ( IF EXISTS )
    if (user.avatar === constantValues.DEFAULT_AVATAR) {
      throw new ApiError(404, "Avatar Not Found!")
    } else {
      await deleteFromCloudinary(user.avatar);
      deletedAvatarUrl = user.avatar
    }

    // 3. UPDATION: USER'S AVATAR SET TO EMPTY IN DB
    // user.avatar = constantValues.DEFAULT_AVATAR;
    user.avatar = "";
    await user.save();

    // 4. VALIDATOR: VERIFY AVATAR REPLACEMENT IN DB
    const updatedUser = await User.findById(req.user?._id).select("avatar");

    if (updatedUser && updatedUser.avatar !== user.avatar) {
      console.log({updatedUserAvatar: updatedUser.avatar, userAvatar: user.avatar})
      throw new ApiError(500, "Avatar Replacement Failed!");
    }

    // 5. SEND: RESPONSE ON FRONTEND
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Your Avatar Is Removed Successfully!",
          updatedUser
        )
      );
  } catch (error) {
    // ROLLBACK: IF DELETION FROM CLOUDINARY WAS SUCCESSFUL BUT DB UPDATION FAILED. SO ROLLBACK BY RE-UPLOADING THE DELETED AVATAR
    // deletedAvatarUrl && await uploadToCloudinary(deletedAvatarUrl);

    throw new ApiError(
      500,
      error?.message || "Unable To Remove Your Avatar!!!",
      "No Tips",
      error,
      error?.stack
    );
  }
});

const changeCurrentUserDetails = asyncHandler( async (req, res) => {
  try {
    // 0. REFINE & FILTER: USER GIVES USERNAME || ABOUT || EMAIL TO CHANGE - UPDATE THE REQ-BODY
    const { fullName, email, userName, about } = req?.body;

    if (fullName || email || userName || about) {
      fullName ? (req.body.fullName = fullName) : null;
      email ? (req.body.email = email) : null;
      userName ? (req.body.userName = userName) : null;
      about ? (req.body.about = about) : null;
    }

    // 1. VALIDATOR: USERNAME CONVENTION
    const userNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (userName) {
      if (!userNameRegex.test(userName)) {
        throw new ApiError(400, "Invalid Username!");
      }
    }

    // 2. VALIDATOR: FULL-NAME CONVENTION
    const fullNameRegex = /^[a-zA-Z ]+$/;

    if (fullName) {
      if (!fullNameRegex.test(fullName)) {
        throw new ApiError(400, "Invalid Full Name!");
      }
    }

    // 3. VALIDATOR: EMAIL
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(email) {
      if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, "Invalid Email Address!");
      }
    }

    // 4. CREATION: USER OBJECT/DOCUMENT IN DB
    const userObj = {
      fullName,
      userName: userName.toLowerCase(),
      email,
      about,
    };

    if (!userObj) {
      throw new ApiError(
        501,
        error?.message || "Failed To Update Your Details!"
      );
    }

    // 5. UPDATION: USER DETAILS
    const updatedUser = await User.findByIdAndUpdate(req.user._id, userObj, {
      new: true,
    });

    if (!updatedUser) {
      throw new ApiError(
        503,
        error?.message || "Failed To Update Your Details In DB!"
      );
    }

    // 6. SEND: RESPONSE ON FRONTEND
    return res
    .status(200)
    .json(new ApiResponse(200, "Your Details Updated Successfully!", updatedUser))

  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Failed To Update Your Details!",
      error,
      error?.stack
    );
  }
  // 0. 
  // 1. EXTRACTION: USERNAME, EMAIL, ABOUT FROM REQ-BODY
})

export {
  registerUser,
  loginUser,
  logoutUser,
  generateNewAccessToken,
  changeCurrentPassword,
  getAllUsers,
  changeUserAvatar,
  removeUserAvatar,
  changeCurrentUserDetails,
};