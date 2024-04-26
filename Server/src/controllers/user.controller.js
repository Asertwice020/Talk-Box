import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";
import jwt from "jsonwebtoken";

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
      error?.message ||
        "Internal Server Error While Generating Access And Refresh Tokens!",
      "1. TIP-1  2. TIP-2",
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
  try {

    const { userName, fullName, email, password } = req.body;
    // NOTE => YOU CAN PASS RAW-JSON AS WELL AS FORM DATA IN THE REQ.BODY
    // LOG
    // console.log({
    //   userName,
    //   fullName,
    //   email,
    //   password
    // })

    // 1. VALIDATION - ALL FIELDS ARE REQUIRED
    const emptyFieldsValidation = [userName, fullName, email, password].some(field => !field || field.trim().length === 0)
    console.log({emptyFieldsValidation})

    if (emptyFieldsValidation) {
      throw new ApiError(
        406,
        "All Fields Are Required!",
        "1. TIP-1   2. TIP-2"
      );
    }

    // 2. USERNAME CONVENTION VALIDATION
    const userNameRegex = /^[a-zA-Z0-9._-]+$/;

    if (!userNameRegex.test(userName)) {
      throw new ApiError(
        400,
        // "Username should contain only letters, numbers, underscore, dot, dash! :: user.controller.js/registerUser",
        "Invalid username",
        "1. TIP-1   2. TIP-2"
      );
    }

    // 3. FULL-NAME CONVENTION VALIDATION
    const fullNameRegex = /^[a-zA-Z ]+$/;

    if (!fullNameRegex.test(fullName)) {
      throw new ApiError(
        400,
        // "Full-Name should contain only space, letters! :: user.controller.js/registerUser",
        "Invalid full name",
        "1. TIP-1   2. TIP-2"
      );
    }

    // 4. EMAIL VALIDATION
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || email.trim().length < 0) {
      throw new ApiError(
        400,
        // "Email Field Can't Be Empty! :: user.controller.js/registerUser",
        "Invalid email address",
        "1. TIP-1   2. TIP-2"
      );
    }

    // 5. DOES USER EXISTS ALREADY?
    const existedUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (existedUser) {
      throw new ApiError(
        409,
        // "User with this username or email already exists!  :: user.controller.js/registerUser",
        "User with this username or email already exists!",
        "1. TIP-1   2. TIP-2"
      );
    }

    // 6. CHECK FOR AVATAR IMAGE?
    let avatarLocalPath;
    if ( req?.file && req?.file instanceof Object && req?.file?.path ) {
      // LOG
      // try {
      //   console.log({
      //     fullReqFileObj: req.file,
      //     imagePath: req.file.path,
      //   });
      // } catch (error) {
      //   console.log(error?.message || "req.files doesn't provide a url of cloudinary")
      // }
      avatarLocalPath = req.file.path;
    }
    
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required!");
    }

    // 7. UPLOAD AVATAR ON CLOUDINARY
    const avatar = await uploadToCloudinary(avatarLocalPath)

    if (!avatar) {
      throw new ApiError(400, "Failed to upload your avatar on cloudinary!");
    }

    // 8. OBJECT CREATION IN DB
    const user = await User.create({
      fullName,
      userName: userName.toLowerCase(),
      email,
      avatar: avatar?.url,
      // avatar: avatar?.secure_url, -> it's also work same but i don't know the difference yet!
      password,
    });

    if (!user) {
      throw new ApiError(
        500,
        "Failed to submit your details in DB!",
        "1. TIP-1  2. TIP-2"
      );
    }
    // LOG  
    // console.log(`user: `, user);

    // 9. REMOVING SOME FIELDS BEFORE SENDING RESPONSE TO FRONTEND
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Failed to register yourself in DB!",
        "1. TIP-1  2. TIP-2"
      );
    }
    // LOG
    console.log(`created-user: `, createdUser);

    // 10. SENDING THE RESPONSE TO THE FRONTEND
    return res
      .status(201)
      .json(new ApiResponse(200, "User Registered Successfully!", createdUser));

  } catch (error) {
    throw new ApiError(
      403,
      error?.message ||
        "Something Went Wrong While Registering The User! :: user.controller.js/registerUser",
      "1. TIP-1   2. TIP-2",
      error,
      error?.stack
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    // NOTE => YOU CAN ONLY PASS RAW-JSON DATA IN THE REQ.BODY
    // LOG
    console.log({
      userName,
      email,
      password
    })

    // 1. VALIDATION - USERNAME OR EMAIL, ONE IS REQUIRED
    if (!(userName || email)) {
      throw new ApiError(
        400,
        "UserName or Email is required!",
        "1. TIP-1  2. TIP-2"
      );
    }

    // 2. FIND USER IN DB
    const user = await User.findOne({
      $or: [{ userName }, { email }],
    });

    // 3. IF USER NOT FOUND
    if (!user) {
      throw new ApiError(404, "User does not exists!");
    }

    // 4. PASSWORD VALIDATION
    const isPasswordValid = await user.comparePassword(password);

    // 5. IF PASSWORD NOT MATCHED
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid Password!", "No Debugging Tips");
    }

    // 6. GENERATE ACCESS & REFRESH TOKENS
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // FIXME: UPDATE THE USER OBJECT WITH TOKENS INSTEAD OF MAKING ANOTHER REQUEST TO DB, WHICH YOU ARE DOING RIGHT NOW! [CHECK IT NEEDS A _id OR NOT AND IF NOT SO HOW IT'S WORKING]

    // 7. REMOVING SOME FIELDS BEFORE SENDING RESPONSE TO FRONTEND
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // 8. SEND THE RESPONSE TO FRONTEND
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
      401,
      error?.message ||
        "Forbidden Unauthorized User! :: user.controller.js/loginUser",
      "1. TIP-1   2. TIP-2",
      error,
      error?.stack
    );
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // LOG
    console.log("[logoutUser controller] req.user: ", req.user);

    await User.findByIdAndUpdate(
      req.user._id,
      // $unset removes the field from document
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

const getAllUsers = asyncHandler( async (req, res) => {
  try {
    // LOG
    // endpoint will look like: /api/users/all-users?search=sumit result: sumit.
    // const users = req?.query?.search
    // console.log(users);

    if (!req?.query?.search) {
      throw new ApiError(400, "You didn't pass anything to search!", "No Tip!");
    }

    const data = req.query.search && {
      $or: [
        { userName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    };

    if (!data) {
      // LOG
      console.log({ data });
      throw new ApiError(
        404,
        "UNREADABLE OR NO DATA COMES IN USERNAME AND EMAIL!",
        "No Tip!"
      );
    }

    const users = await User.find(data).find({ _id: { $ne: req?.user?._id } });

    // LOG
    console.log({
      dataUsername: data.$or.userName,
      dataEmail: data.$or.email,
      users,
    });

    if ( !users || users.length === 0) {
      throw new ApiError(404, "No result found!", "No Tip!");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Your Requested Thing Searched Successfully!",
          users
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while getting your search results!",
      "NO Tips!",
      error,
      error?.stack
    ) 
  }
})

const generateNewAccessToken = asyncHandler(async (req, res) => {
  // first verify user's access token is expired, if yes, so verify user's refresh token through server, if it's match so run the method which you created for generating both tokens, so now user has both new tokens
  // you can access the accessToken by cookies: req.cookies?.refreshToken || req.body?.refreshToken

  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

    // LOG
  console.log("[BEFORE] req.cookies.refreshToken: ", req.cookies?.refreshToken);
  console.log("[BEFORE] req.cookies.accessToken: ", req.cookies?.accessToken);

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request!");
  }

  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      configEnv.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      // throw new ApiError(401, "Invalid Session ID!");
      throw new ApiError(401, "Invalid Refresh Token ID!");
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token ID!");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is either expired or used!");
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // LOG
    console.log("[AFTER] req.cookies.refreshToken: ", req.cookies?.newRefreshToken);
    console.log("[AFTER] req.cookies.accessToken: ", req.cookies?.accessToken);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          "Access Token Refreshed Successfully! As Well As Refresh Token Too",
          // "Access token refreshed"
          { accessToken, refreshToken: newRefreshToken }
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Unauthorized Request || Invalid Refresh Token!"
    );
  }
});

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

export {
  registerUser,
  loginUser,
  logoutUser,
  generateNewAccessToken,
  changeCurrentPassword,
  getAllUsers,
};