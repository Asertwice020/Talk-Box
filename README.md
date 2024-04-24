# WE ARE FOLLOWING THE NAMES EXPORT AND IMPORT.

export { configEnv };
import { configEnv } from './path'


-anitube user.controller.js code

import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";
import configEnv from "../configEnv/index.js";
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
      "Internal Server Error While Generating Access And Refresh Tokens!",
      error?.message
    );
  }
};

// TODO: `SETTING COOKIES OPTIONS SO, USER CAN'T MODIFY THESE ON THE FRONTEND SIDE, IT ONLY CAN BE MODIFIED BY SERVER SIDE. ALTHOUGH COOKIES VISIBLE TO USER [IF USER CAN FIND IT, BUT UNABLE TO MODIFY]
const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    // TODO: GET THE USER DATA FROM THE REQUEST BODY
    const { userName, fullName, email, password } = req.body;

    // TODO: VALIDATION - ALL FIELDS ARE REQUIRED
    if (
      [userName, fullName, email, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      const error = new ApiError(400, "All Fields Are Required!");
      console.error(error);
    }

    // TODO: USERNAME AND FULL-NAME CONVENTION VALIDATION
    const userNameRegex = /^[a-zA-Z0-9._-]+$/;
    const fullNameRegex = /^[a-zA-Z ]+$/;

    if (!userNameRegex.test(userName)) {
      throw new ApiError(
        400,
        "Username should contain only letters, numbers, underscore, dot, dash"
      );
    }

    if (!fullNameRegex.test(fullName)) {
      throw new ApiError(400, "Full-Name should contain only space, letters.");
    }

    // TODO: EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || !email || email.trim().length < 0) {
      throw new ApiError(400, "Email Field can't be empty!");
    }

    if (!email.includes("@")) {
      throw new ApiError(400, "Email Field Doesn't have '@' Symbol!");
    }

    // TODO: DOES USER EXISTS ALREADY?
    const existedUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (existedUser) {
      throw new ApiError(
        409,
        "User with this username or email already exists!"
      );
    }

    // TODO: CHECK FOR IMAGES SEND BY THE USER?
    // AVATAR
    let avatarLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.avatar) &&
      req.files.avatar.length > 0
    ) {
      avatarLocalPath = req.files.avatar[0].path;
    }

    // COVER-IMAGE
    let coverImageLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar image is required!");
    }

    // TODO: UPLOADING TO CLOUDINARY AFTER CONFIRMATION
    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    // TODO: OBJECT CREATION IN DB
    const user = await User.create({
      userName: userName.toLowerCase(),
      fullName,
      email,
      avatar: avatar?.url || "",
      coverImage: coverImage?.url || "",
      password,
    });

    if (user) console.log(user);

    // FIXME: THIS APPROACH CAN BE OPTIMIZED IN FUTURE CAUSE IT TAKES ONE MORE DB CALL TO CHECK. 1. TO CHECK THAT USER GOT CREATED IN DB IN REAL OR NOT  2. TO REMOVE PASSWORD AND OTHER DON'T NEEDED FIELDS IN USER RESPONSE
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // TODO: IF USER DON'T GOT CREATED IN DB FOR REAL
    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user!"
      );
    }

    // TODO: SEND THE RESPONSE TO FRONTEND
    return res
      .status(201)
      .json(new ApiResponse(200, "User Registered Successfully!", createdUser));
  } catch (error) {
    throw new ApiError(
      403,
      error?.message || "Something went wrong while registering the user",
      error,
      error?.stack
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  // console.log(
  //   `userName: ${userName}, email: ${email}, password: ${password} req.body[JSON]: ${JSON.stringify(req.body)} req-object: ${req}`
  // );

  // TODO: VALIDATION
  if (!(userName || email)) {
    throw new ApiError(400, "UserName or Email is required!");
  }

  // TODO: FIND USER IN DB
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  // TODO: IF USER NOT FOUND
  if (!user) {
    throw new ApiError(404, "User does not exists!");
  }

  // TODO: PASSWORD VALIDATION
  const isPasswordValid = await user.isPasswordMatched(password);

  // TODO: IF PASSWORD NOT MATCHED
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials!");
  }

  // TODO: GENERATE ACCESS & REFRESH TOKENS
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // FIXME: UPDATE THE USER OBJECT WITH TOKENS INSTEAD OF MAKING ANOTHER REQUEST TO DB, WHICH YOU ARE DOING RIGHT NOW!
  const loggedInUser = await User.findById(user.id).select(
    "-password -refreshToken"
  );

  // TODO: LOGGING THE RESPONSE IN CONSOLE (TESTING PURPOSES)
  console.log(
    "accesToken :",
    accessToken,
    "refreshToken :",
    refreshToken,
    "user :",
    loggedInUser
  );

  // TODO: SEND THE RESPONSE TO FRONTEND
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
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log("req.user: ", req.user);
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User Logged Out Successfully!", {}));
});

const generateNewAccessToken = asyncHandler(async (req, res) => {
  // first verify user's access token is expired, if yes, so verify user's refresh token through server, if it's match so run the method which you created for generating both tokens, so now user has both new tokens
  // you can access the accessToken by cookies: req.cookies?.refreshToken || req.body?.refreshTooken

  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  console.log("req.cookies.refreshToken: ", req.cookies?.refreshToken);
  console.log("req.cookies.accessToken: ", req.cookies?.accessToken);

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

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    console.log("req.cookies.refreshToken: ", req.cookies?.refreshToken);
    console.log("req.cookies.accessToken: ", req.cookies?.accessToken);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          "Access Token Refreshed Successfully! As Well As Refresh Token Too",
          { accessToken, refreshToken }
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
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All Fields are required!");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized Request!");
  }

  const isPasswordValid = await user.isPasswordMatched(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Your old password is incorrect!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  if (oldPassword === newPassword) {
    throw new ApiError(400, "Your new passwords same as old!!");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Your confirm password is incorrect!!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "you're password has been changed successfully!", {})
    );
  // FIXME: THERE IS AN ISSUE WITH THIS, WHEN YOU TRY TO CHECK BOTH PASSWORDS OLD === NEW, SO HOW YOU WILL GONNA CHECK? IT IS A PROBLEM TO ME RIGHT NOW, CAUSE I DON'T READ DOCS OF BCRYPT YET, MAYBE THEY PROVIDE SOMETHING FOR THIS, OTHER WISE I HAVE TO
  // 1. FIRST CONTAIN THE OLD PASSWORD IN A VARIALBE BEFORE CHANGING INTO DB
  // 2. AND, AFTER MAKE THE PASSWORD CHANGE IN DB, I NEED TO ==>>> NO THAT'S THE WRONG WAY, I  JUST REALISE❌❌ never mind.
});

const changeAccountDetails = asyncHandler(async (req, res) => {
  const { fullName } = req.body;

  if (!fullName) {
    throw new ApiError(400, "Full Name is required!");
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
      },
    },
    { new: true }
  ).select("-password");

  // TODO: HITESH SIR SAID THAT, "WHEN WE USE { new: true} WHILE UPDATING IT SO IT RETURN ALL THE CHANGES WHICH HE MADE IN THE RETURN SO WHILE TESING JUST UN-COMMENT THIS TO TEST: IT'S REALLY DOES THAT OR NOT"
  /*
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullName: fullName,
        },
      },
      { new: true }
    ).select("-password");

      return res
        .status(200)
        .json(new ApiResponse(200, "Account Details Upadated Successfully!", updatedUser));
        */

  return res
    .status(200)
    .json(new ApiResponse(200, "Account Details Upadated Successfully!", {}));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Current User Fetched Successfully!", req.user));
});

const changeUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required!");
  }

  // FIXME: HERE, HITESH SIR DOESN'T FOCUS ON HOW TO MANAGE THE FILES ON THE CLOUDINARY SIDE, AND DELETION OF OLD AVATARS SO DO THAT BY YOURSELF. IT'S EASY. and be catious.
  // TIP: WHEN YOU SUCCESSFULLY UPLOAD NEW AVATAR THEN MOVE ON TO DELETION OF OLD ONE.

  const avatar = await uploadToCloudinary(avatarLocalPath);

  if (!avatar || !avatar.url) {
    throw new ApiError(
      400,
      "Something went wrong while uploading avatar to cloudinary!"
    );
  }

  const userAvatar = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Your Avatar is changed successfully!", userAvatar)
    );
});

const changeUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image is required!");
  }

  // FIXME: HERE, HITESH SIR DOESN'T FOCUS ON HOW TO MANAGE THE FILES ON THE CLOUDINARY SIDE, AND DELETION OF OLD AVATARS SO DO THAT BY YOURSELF. IT'S EASY

  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!coverImage || !coverImage.url) {
    throw new ApiError(
      400,
      "Something went wrong while uploading cover image to cloudinary!"
    );
  }

  const userCoverImage = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Your Cover Image is changed successfully!",
        userCoverImage
      )
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;

  console.log(userName);

  if (!userName?.trim()) {
    throw new ApiError(400, "Username is either empty or incorrect!");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.trim()?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedChannelsCount: {
          $size: "subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        subscribedChannelsCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(400, "Channel Doesn't Exist!");
  }

  // TODO: LOGGING CHANNEL FOR TESTING
  console.log(`channel 0th element: `, channel[0]);
  console.log(`full channel element: `, channel);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User's Channel Fetched Successfully!", channel[0])
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.objectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            owner: {
              $first: "$owner"
            }
          }
        ],
      },
    },
  ]);

  if (!user) {
    throw new ApiError(401, "Something went wrong while fetching watch history!")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(
      200, "watch history fetched successfully!", user[0].watchHistory
    )
  )
})

export {
  registerUser,
  loginUser,
  logoutUser,
  generateNewAccessToken,
  changeCurrentPassword,
  changeAccountDetails,
  getCurrentUser,
  changeUserAvatar,
  changeUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};









const generateNewAccessToken = asyncHandler(async (req, res) => {
  // first verify user's access token is expired, if yes, so verify user's refresh token through server, if it's match so run the method which you created for generating both tokens, so now user has both new tokens
  // you can access the accessToken by cookies: req.cookies?.refreshToken || req.body?.refreshTooken

  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  console.log("req.cookies.refreshToken: ", req.cookies?.refreshToken);
  console.log("req.cookies.accessToken: ", req.cookies?.accessToken);

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

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    console.log("req.cookies.refreshToken: ", req.cookies?.refreshToken);
    console.log("req.cookies.accessToken: ", req.cookies?.accessToken);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          "Access Token Refreshed Successfully! As Well As Refresh Token Too",
          { accessToken, refreshToken }
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Unauthorized Request || Invalid Refresh Token!"
    );
  }
});