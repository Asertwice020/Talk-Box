import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const sendMessage = asyncHandler(async (req, res) => {
  try {
    // 1. EXTRACT CONTENT AND CHAT-ID FROM REQUEST BODY
    const { content, chatId } = req?.body;

    // 2. CHECK IF CONTENT AND CHAT-ID ARE PROVIDED
    if (!(content && chatId)) {
      throw new ApiError(400, "All Fields Are Required!", "No Tip");
    }

    // 3. CREATE NEW MESSAGE OBJECT
    const messageObject = {
      sender: req?.user?._id,
      content,
      chat: chatId,
    };

    // 4. CREATE NEW MESSAGE
    let message = await Message.create(messageObject);

    if (message instanceof Object && !message) {
      throw new ApiError(500, "Unable to create your message in DB!", "No tip!");
    }

    // 5. POPULATE SENDER AND CHAT FIELDS OF THE NEW MESSAGE
    message = await message.populate("sender", "userName avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "userName avatar email",
    });

    if ( message instanceof Object && !message ) {
      throw new ApiError(500, "Unable to populate your message!", "No tip!")
    }

    // 6. UPDATE LATEST MESSAGE OF THE CHAT
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    // 7. SEND THE CREATED MESSAGE AS RESPONSE
    return res
      .status(201)
      .json(new ApiResponse(200, "Your Message Sent Successfully!", message));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while sending message!!",
      "No Tip!",
      error,
      error?.stack
    );
  }
});

const fetchAllMessages = asyncHandler(async (req, res) => {
  try {
    // 1. EXTRACTING CHAT-ID FROM REQ-PARAMS
    const chatId = req?.params?.chatId;

    // LOG
    // console.log({chatId})

    if (!chatId) {
      throw new ApiError(400, "You didn't provide valid information!");
    }

    // 2. FIND ALL MESSAGES RELATED TO THE SPECIFIED CHAT ID
    const messages = await Message.find({ chat: chatId })
      // 3. POPULATE SENDER AND CHAT FIELDS FOR EACH MESSAGE
      .populate("sender", "userName avatar email")
      .populate("chat");

    if (!Array.isArray(messages)) {
      throw new ApiError(
        500,
        "Something Went Wrong To Save And Populate Messages In DB!"
      );
    }

    if (messages.length < 1) {
      throw new ApiError(404, "No Messages Found!");
    }
    
    // 4. SEND THE RETRIEVED MESSAGES AS A JSON RESPONSE TO THE FRONTEND
    return res
      .status(200)
      .json(
        new ApiResponse(200, "All The Messages Fetched Successfully!", messages)
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while fetching all the messages!!",
      "No Tip!",
      error,
      error?.stack
    );
  }
});

export { sendMessage, fetchAllMessages };