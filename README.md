# WE ARE FOLLOWING THE NAMES EXPORT AND IMPORT.

# TODO:
  IF YOU NEED TO MAKE THIS "IS-REQUESTER-IS-GROUP-ADMIN-OR-NOT" TO MORE PLACES AND SO YOU DECIDE TO MAKE IT A MIDDLEWARE LIKE: MULTER, AUTH. SO YOU CAN VISIT THIS CHATGPT-&-YOU CONVERSATION.
  LINK -> https://chat.openai.com/c/db38775d-4533-4d98-8b72-f3fb2be6ec64
  NOTE: THIS CONVERSATION IS TOO LONG, SO DO IT THIS WHEN YOU HAVE NEED & PATIENT & SILENCE & SILENT-ENVIRONMENT.

# COMMENTS-MODEL:
// 1. EXTRACTION: REGISTRATION DETAILS FROM REQ-BODY
// 2. VALIDATOR: ALL FIELDS ARE REQUIRED
// 8. UPLOAD: AVATAR ON CLOUDINARY
// 9. CREATION: USER OBJECT/DOCUMENT IN DB
// 1. DELETION: REMOVING PASSWORD, REFRESH-TOKEN BEFORE SENDING RESPONSE TO FRONTEND
// 1. SEND: RESPONSE ON FRONTEND
// 3. FIND: USER IN DB
// 5. GENERATION: ACCESS & REFRESH TOKENS
// 4. EXPLAIN: something you want to explain before code

# VISIT THESE LINES:
PATH: LINE NUMBER

1. user.controller.js: {
  80: HOW DOES THIS VALIDATOR WORK FINE, WITHOUT NOT OPERATOR(!)

  97: IF USER PROVIDES AVATAR BUT, CLOUDINARY FALIED TO UPLOAD AVATAR. SO WE SHOULD STOP THE PROCESS AT THAT MOMENT OTHERWISE IN THE DB: AVATAR FIELD WILL EMPTY. (TEST CASE)  

  106: WHY DID NOT YOU USE "secure_url" -> // avatar: avatar?.secure_url, -> it's also work same but i don't know the difference yet!

  188: I UNABLE TO CATCH WHY WE ARE GIVING ALL THE DATA TO "USER". WHAT IS THIS USER ANYWAY (UNABLE TO THINK/VIRTUALIZE)

  211: REVIEW THE LOGOUT CONTROLLER CAREFULLY, MAYBE THERE IS A LOOPHOLE. IF THIS CONTROLLER ONLY REMOVES REFRESH TOKEN FIELD FROM THAT PARTICULAR USER DOCUMENT.
  S0 ->
  [{
    REGISTER-STATE: THERE IS NO REFRESH TOKEN VALUE IN THAT FILED. IT MUST BE EMPTY.

    LOGGED-IN-STATE: REFRESH TOKEN FIELD NOW HAVE A VALUE.

    LOGOUT-STATE: THAT PARTICULAR USER DOCUMENT DOESN'T HAVE ANY REFRESH TOKEN FIELD NOW.
  },
  {
    NOTE: I DON'T TOUCH THE CODE YET. FIRST TEST THIS OUT. AND VALIDATE YOUR THEORY.
  }]

  287: REVIEW THE GENERATE-NEW-ACCESS-TOKEN ENDPOINT CONTROLLER CAREFULLY. 

}


------------ PROFILE.JSX ----------------
import { useSelector } from "react-redux";
import { IoArrowBackSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import ImageCropper from './ImageCropper'
import { constantValues } from "../constants";
import { useState } from "react";

const Profile = ({ isProfileOpen, setIsProfileOpen }) => {
  const [editAvatar, setEditAvatar] = useState(false);
  const [showList, setShowList] = useState(false); // State to control list visibility
  const [listLeft, setListLeft] = useState(null); // State to store list left position
  const [listTop, setListTop] = useState(null); // State to store list top position

  const handleCloseProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const authUser = useSelector((state) => state.user.authUser);

  const onOpenedProfileAvatarCilckHandler = (e) => {
    if (isProfileOpen && e.target.currentSrc === authUser.avatar) {
      setEditAvatar((prev) => !prev);
      setShowList((prev) => !prev); // Toggle list visibility on click

      // Calculate list position based on click coordinates
      const { clientX, clientY } = e.nativeEvent;
      setListLeft(clientX + 10); // Add an offset for better positioning
      setListTop(clientY + 10);
    }
  };

  const listContent = (
    <div className="bg-white shadow-md rounded-md p-2">
      {/* Add your list items here */}
      <p>View Photo</p>
      <p>Take Photo</p>
      <p>Upload Photo</p>
      <p>Remove Photo</p>
    </div>
  );

  return (
    <div className="bg-[#111B21] w-full h-full absolute top-0 left-0">
      <header className="p-4 bg-[#202C33] h-[15%] flex items-end gap-7">
        <span
          onClick={handleCloseProfile}
          className="cursor-pointer text-2xl font-[100] mb-[1px]"
        >
          <IoArrowBackSharp />
        </span>
        <span className="font-[600] text-lg">Profile</span>
      </header>

      <main className="bg-red-600 h-full p-5">
        <section className="bg-green-500 flex flex-col justify-center items-center gap-3">
          {/* 1. AVATAR */}
          <Avatar
            className="cursor-pointer w-[50%] h-[50%] rounded-full"
            onClick={onOpenedProfileAvatarCilckHandler}
          >
            <AvatarImage src={authUser?.avatar} alt="avatar" />
            <AvatarFallback className="bg-[#181C1F]">
              {authUser?.userName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* 1.1. IMAGE CROPPING */}
          <ImageCropper />
        </section>

        {/* 2. USER-NAME & ABOUT SECTION */}
        <section className="bg-blue-600 mt-3">
          {/* 2.1 USERNAME */}
          <div>
            <h2>Username</h2>
          </div>
        </section>
      </main>

      {/* <main className="-1">
        <section className="h-1/2">
          <Avatar className="relative cursor-pointer w-[50%] h-[50%] bg-white">
            <AvatarImage
              src={authUser?.avatar}
              // className="hover:bg-[#000000a0]"
              alt="avatar"
            />
            <AvatarFallback className="bg-[#181C1F]">
              {authUser?.userName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </section>

        {/* USER-NAME & ABOUT SECTION */}
      {/* <section className=" flex flex-col gap-5 w-full px-2 text-[#008052]">
          <div className="flex flex-col gap-4">
            <h2 className="font-[300]">Username</h2>
            <p>{authUser?.userName}</p>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-[300]">About</h2>
            <p>{authUser?.email}</p>
          </div>
        </section> */}
      {/* </main> */}
    </div>
  );
};

export default Profile




-----------------------------------------------------------------
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    console.log("Submitting form...");
    // FIXME: PREVENT MULTIPLE SUBMISSIONS
    try {
      const formData = new FormData();
      formData.append("userName", user.userName);
      formData.append("fullName", user.fullName);
      formData.append("email", user.email);
      formData.append("avatar", user.avatar);
      formData.append("password", user.password);

      const options = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }

      const response = await axios.post(userRoutes.register, formData, options);
      // LOG
      console.log({fullResponse: response});

      const authUser = response?.data?.data;

      if (!authUser && !(authUser instanceof Object)) {
        toast.error("Failed To Show Your Avatar!");
      }

      if (response.data.success) {
        dispatch(setAuthUser(authUser));
        toast.success(response.data.message);
        navigate("/");
      }
    } catch (error) {
      if (error.response && error?.response?.status > 400) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("An Error Occurred. Try Again Later!!!.");
      }
    }
  };