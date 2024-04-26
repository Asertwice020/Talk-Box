import { asyncHandler } from "../utils/asyncHandler.util.js"
import { Chat } from "../models/chat.model.js"
import { ApiError } from "../utils/apiError.util.js"
import { ApiResponse } from "../utils/apiResponse.util.js";
import { User } from "../models/user.model.js"
import { populate } from "dotenv";

const accessChat = asyncHandler(async (req, res) => {
  try {
    const { userId } = req?.body;

    // 1. VALIDATE THE USER-ID
    if (!userId) {
      throw new ApiError(
        400,
        "UserId parameter is missing in the request body."
      );
    }

    // 2. FIND EXISTING CHAT
    let existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req?.user?._id, userId] },
    })
      .populate("users", "-password")
      .populate("latestMessage");

    // 3. VALIDATE THE CHAT FOUND OR NOT
    if (!existingChat) {
      console.log({existingChatConsole: existingChat})
      const errorObject = new ApiError(
        404,
        "YOU DON'T HAVE ANY CHATS IN PAST WITH THIS USER, CREATE ONE!"
      );
      console.log(errorObject);

      // 4. CREATE A NEW CHAT IF NO EXISTING CHAT FOUND

      // EXTRACTING THE USERNAME OF OTHER USER, WHICH ONE YOU DON'T HAVE ANY CHAT YET.
      const anotherPersonUsername = await User.findById(userId).select("userName -_id")
      // LOG
      // console.log({ anotherPersonUsername })

      const newChat = await Chat.create({
        // chatName: `Your chat with ${anotherPersonUsername.userName}`,
        chatName: `sender`,
        isGroupChat: false,
        users: [req?.user?._id, userId],
      });

      // 5. RETURN A RESPONSE TO FRONTED WITH NEW CREATED CHAT
      return res
        .status(201)
        .json(new ApiResponse(201, "New chat created successfully.", newChat));
    }

    // 6. RETURN THE EXISTING CHAT (IF FOUND)
    return res
      .status(200)
      .json(new ApiResponse(200, "Existing chat found.", existingChat));
  } catch (error) {
    throw new ApiError(500, error?.message || "Something went wrong while access or creating chat for you with the given userId.", "No Tip!", error, error?.stack);
  }
});

const fetchChat = asyncHandler( async (req, res) => {
  try {
    // approach: we are fetching all the chats for login user, to hum chat model me ek users naem se array h, jisme phla to ye banda hoga, and dusra koi aur jisse isne bate ki h, and humare pass login user ki id h, verifyjwt se aa jayegi. ab

    // 1. FETCH CHATS FOR THE LOGGED IN USER
    let fullChatDocument;
    fullChatDocument = Chat.find({
      users: { $elemMatch: { $eq: req?.user?._id } },
    })
      .populate("groupAdmin", "-password -refreshToken")
      .populate("users", "-password -refreshToken")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // 2. IF CHATS WERE NOT RETRIEVED SUCCESSFULLY
    if (!fullChatDocument) {
      throw new ApiError(404, "No chats found for the user.");
    }

    // 3. POPULATE LATEST MESSAGE SENDER DETAILS
    fullChatDocument = await User.populate(fullChatDocument, {
      path: "latestMessage.sender",
      select: "userName fullName email avatar",
    });

    // 4. CHECK IF LATEST MESSAGE SENDER DETAILS WERE POPULATED SUCCESSFULLY
    if (!fullChatDocument) {
      throw new ApiError(
        404,
        "Could not populate sender details for latest messages."
      );
    }

    // 5. RETURN SUCCESS RESPONSE WITH CHATS
    return res
      .status(200)
      .json(
        new ApiResponse(200, "chats fetched successfully!", fullChatDocument)
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while fetching the chat for you.",
      "No Tip!",
      error,
      error?.stack
    ); 
  }
})

const createGroupChat = asyncHandler( async (req, res) => {
  // 1. CHECK IF USERS AND NAME FIELDS ARE PROVIDED IN REQUEST BODY
  if (!req?.body?.users || !req?.body?.chatName) {
    throw new ApiError(
      400,
      "All Fields Are Required!",
      "No Tip"
    )
  }

  let users;
  try {
    // 2. PARSE USERS FROM REQUEST BODY
    try {
      users = JSON.parse(req?.body?.users);
    } catch (error) {
      throw new ApiError(400, "Unable to parse the given array!", "No Tip");
    }

    if (!Array.isArray(users)) {
      throw new ApiError(400, "Parsed result is not an array!", "No Tip");
    }

    // 3. CHECK IF AT LEAST TWO USERS ARE PROVIDED
    if (users.length < 2) {
      throw new ApiError(
        400,
        "Minimum 2 users are required to create a group chat!",
        "No Tip"
      );
    }

    // 4. ADD REQUESTING USER TO THE USERS ARRAY (WHO SUPPOSED TO CREATE THIS GROUP)
    users.push(req?.user);

    // 5. CREATE GROUP CHAT
    const groupChat = await Chat.create({
      chatName: req?.body?.chatName,
      users,
      isGroupChat: true,
      groupAdmin: req?.user,
    });

    if (!(groupChat instanceof Object)) {
      throw new ApiError(
        500,
        "Failed To Create Your Group Chat In DB!!!",
        "No Tip"
      )
    }

    // 6. POPULATE USERS AND GROUP ADMIN FOR THE CREATED GROUP CHAT
    const populatedGroupChat = await Chat.findOne({ _id: groupChat?._id })
      .populate("users", "-password -refreshToken")
      .populate("groupAdmin", "-password -refreshToken");
    
    if (!(populatedGroupChat instanceof Object)) {
      throw new ApiError(
        500,
        "Failed To Populate Your Already Created Group Chat In DB!!!",
        "No Tip"
      );
    }

    // 7. SEND SUCCESS RESPONSE WITH CREATED GROUP CHAT
    return res
      .status(201)
      .json(new ApiResponse(201, "Your Group Chat Created Successfully!", populatedGroupChat))
    
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while creating the group chat for you.",
      "No Tip!",
      error,
      error?.stack
    );
  }
})

const renameGroupChat = asyncHandler( async (req, res) => {
  // 1. EXTRACT CHAT-ID AND CHAT-NAME FROM REQUEST-BODY
  const { chatId, chatName } = req.body;

  // LOG
  // console.log({chatId,chatName,});

  if (!(chatId || chatName)) {
    throw new ApiError(400, "All Fields Are Required!", "No Tip");
  }

  try {
    // 1.5. CHECK IF THE REQUESTER IS GROUP ADMIN OR NOT

    const groupChatObject = await Chat.findById(chatId);
    // LOG
    // console.log({
    //   groupChatObject,
    //   loggedInUser: req.user._id.toString(),
    //   groupChatAdmin: groupChatObject.groupAdmin.toString(),
    //   trueFalseValue:
    //     groupChatObject.groupAdmin.toString() !== req?.user?._id.toString(),
    //     againTrueFalse: !groupChatObject
    // });

    if ( groupChatObject && groupChatObject.groupAdmin.toString() !== req?.user?._id.toString() ) {
      throw new ApiError(403, "Group Admin Can Perform This Action Only!");
    }

    // 2. UPDATING THE GROUP'S CHAT-NAME WITH THE PROVIDED CHAT-NAME
    const renamedGroupChatName = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: true }
    )
      .populate("users", "-password -refreshToken")
      .populate("groupAdmin", "-password -refreshToken");

    // 3. CHECK IF CHAT WAS FOUND AND RENAMED SUCCESSFULLY
    if (!renamedGroupChatName && !(renameGroupChat instanceof Object)) {
      throw new ApiError(500, "Failed To Renamed The Group Chat", "No Tip");
    }

    // LOG
    // console.log({renamedGroupChatName})

    // 4. SEND THE RENAMES GROUP CHAT AS RESPONSE
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Chat successfully renamed", renamedGroupChatName)
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while renaming the group chat!",
      "No Tip!",
      error,
      error?.stack
    );
  }
})

const addToGroupChat = asyncHandler(async (req, res) => {
  // 1. EXTRACT CHAT-ID AND USER-ID FROM REQUEST BODY
  const { chatId, userId } = req.body;

  if (!(chatId || userId)) {
    throw new ApiError(400, "You didn't provide correct information!");
  }

  try {
    // 2. CHECK IF THE REQUESTER IS GROUP ADMIN OR NOT
    /* TODO:
     IF YOU NEED TO MAKE THIS "IS-REQUESTER-IS-GROUP-ADMIN-OR-NOT" TO MORE PLACES AND SO YOU DECIDE TO MAKE IT A MIDDLEWARE LIKE: MULTER, AUTH. SO YOU CAN VISIT THIS CHATGPT-&-YOU CONVERSATION.
     LINK -> https://chat.openai.com/c/db38775d-4533-4d98-8b72-f3fb2be6ec64
     NOTE: THIS CONVERSATION IS TOO LONG, SO DO IT THIS WHEN YOU HAVE NEED & PATIENT & SILENCE & SILENT-ENVIRONMENT.
    */
    const groupChatObject = await Chat.findById(chatId);

    if ( groupChatObject && groupChatObject.groupAdmin.toString() !== req?.user?._id.toString() ) {
      throw new ApiError(403, "Group Admin Can Perform This Action Only!");
    }

    // 3. ADDING USER IN GROUP CHAT

    const newInstanceAfterAdding = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      // 4. POPULATING USERS AND GROUP-ADMIN FIELDS
      .populate("users", "-password -refreshToken")
      .populate("groupAdmin", "-password -refreshToken");

    // 5. CHECK USER ADDITION IN GROUP CHAT WAS SUCCESSFUL OR NOT
    if (
      !newInstanceAfterAdding &&
      !(newInstanceAfterAdding instanceof Object)
    ) {
      throw new ApiError(404, "Failed To Add User In Group Chat!");
    }

    // 6. SEND THE UPDATED GROUP CHAT AS RESPONSE
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "User Added In Group Chat Successfully!",
          newInstanceAfterAdding
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Unable To Add User In Group Chat!",
      "No Tip",
      error,
      error?.stack
    );
  }
});

const removeFromGroupChat = asyncHandler( async (req, res) => {
  // 1. EXTRACT CHAT-ID AND USER-ID FROM REQUEST BODY
  const { chatId, userId } = req.body;

  if (!(chatId || userId)) {
    throw new ApiError(400, "You didn't provide correct information!");
  }
  try {
    // 2. CHECK IF THE REQUESTER IS GROUP ADMIN OR NOT
    const groupChatObject = await Chat.findById(chatId);

    if (
      groupChatObject &&
      groupChatObject.groupAdmin.toString() !== req?.user?._id.toString()
    ) {
      throw new ApiError(403, "Group Admin Can Perform This Action Only!");
    }

    // 3. REMOVE USER FROM GROUP CHAT
    const removedUserFromGroupChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      // 4. POPULATE USERS AND GROUP-ADMIN FIELDS
      .populate("users", "-password -refreshToken")
      .populate("groupAdmin", "-password -refreshToken");

    // 5. CHECK IF USER WAS REMOVED FROM GROUP CHAT SUCCESSFULLY
    if (
      !removedUserFromGroupChat &&
      !(removedUserFromGroupChat instanceof Object)
    ) {
      throw new ApiError(404, "Failed To Remove User From Group Chat!");
    }

    // 6. SEND THE UPDATED GROUP CHAT AS RESPONSE
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "User Removed From Group Chat Successfully!",
          removedUserFromGroupChat
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Unable To Remove User From Group Chat!",
      "No Tip",
      error,
      error?.stack
    );
  }
})

export {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
};