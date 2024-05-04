------------------------------------------------
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { IoArrowBackSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import AvatarCroppingPopup from "./AvatarCroppingPopup";
import { saveAs } from "file-saver";
import { HiPencil } from "react-icons/hi2";
import { BsEmojiLaughing } from "react-icons/bs"; // emoji icon
import { TiTick } from "react-icons/ti"; // tick icon

const Profile = ({ isProfileOpen, setIsProfileOpen }) => {
  const [isListVisible, setIsListVisible] = useState(false);
  const [listPosition, setListPosition] = useState(null);
  const [isAvatarViewed, setIsAvatarViewed] = useState(false);
  const [isCroppingPopupOpen, setIsCroppingPopupOpen] = useState(false);
  const authUser = useSelector((state) => state.user.authUser) ?? {};
  const avatarRef = useRef(null);
  const handleCloseProfile = () => setIsProfileOpen((prev) => !prev);
  
  // Using a single object to store profile details
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    userName: "",
    about: "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setIsListVisible(false);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleAvatarClick = (e) => {
    if (isProfileOpen) {
      setIsListVisible((prev) => !prev);
      const { clientX, clientY } = e.nativeEvent;
      setListPosition({
        left: Math.min(clientX - 10),
        top: clientY - 10,
      });
    }
  };

  const handleViewAvatar = () => {
    setIsAvatarViewed((prev) => !prev);
  };

  const avatarChangeHandler = () => {
    setIsCroppingPopupOpen(true);
  };
  
  const downloadAvatarHandler = () => {
    // Download logic
  };

  const handleButtonClick = (buttonText) => {
    // Button click handler
  };

  const listButtons = [
    "Download Photo",
    "View Photo",
    "Alter Photo",
    "Remove Photo",
  ];

  const listContent = (
    <div className="bg-slate-700 shadow-md rounded-md py-2 flex flex-col justify-center items-center">
      {listButtons.map((buttonText, index) => (
        <button
          key={index}
          className={`w-full text-left py-2 px-5 text-sm hover:bg-slate-800 ${
            (buttonText === "View Photo" || buttonText === "Download Photo") &&
            !authUser.avatar
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={() => handleButtonClick(buttonText)}
          disabled={
            (buttonText === "View Photo" || buttonText === "Download Photo") &&
            !authUser.avatar
          }
        >
          {buttonText}
        </button>
      ))}
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

      <main className=" h-full p-7">
        {isAvatarViewed ? (
          // Full-screen avatar view
        ) : (
          <section className="flex flex-col justify-center items-center gap-3">
            <Avatar
              ref={avatarRef}
              className={`cursor-pointer w-[55%] h-[55%] ${
                isAvatarViewed ? "" : "rounded-full"
              }`}
              onClick={handleAvatarClick}
            >
              <AvatarImage src={authUser?.avatar} alt="avatar" />
              <AvatarFallback>
                {authUser?.userName?.slice(0, 2).toUpperCase() ?? "CN"}
              </AvatarFallback>
            </Avatar>
          </section>
        )}

        <section className=" mt-8 h-[47%]">
          <form className="flex flex-col flex-wrap gap-5">
            <div className="bg-red-900 flex flex-col   flex-wrap gap-3">
              <p className="text-sm text-[#008052]">Username</p>
              <div className="flex justify-between gap-3">
                {/* Displaying the username from userDetails object */}
                <input
                  type="text"
                  value={userDetails.userName || authUser?.userName}
                  className="bg-black w-full text-white"
                  readOnly={!userDetails.userName} // Make the input readOnly when not editing
                  onChange={(e) => {
                    setUserDetails({ ...userDetails, userName: e.target.value });
                  }}
                />
                {/* Render pencil icon when not editing */}
                {!userDetails.userName && (
                  <HiPencil
                    className="text-[#008052] cursor-pointer"
                    onClick={() => {
                      setUserDetails({ ...userDetails, userName: authUser?.userName });
                    }}
                  />
                )}
                {/* Render tick icon when editing */}
                {userDetails.userName && (
                  <TiTick
                    className="text-[#008052] cursor-pointer"
                    onClick={() => {
                      // Save the edited username to the userDetails object
                      setUserDetails({ ...userDetails, userName: "" }); // Clear the editing mode
                      // You can add logic here to update the username in the state or make an API call
                    }}
                  />
                )}
              </div>
            </div>
          </form>
        </section>
      </main>

      {isCroppingPopupOpen && (
        // Avatar cropping popup
      )}

      {isListVisible && (
        <div className="absolute" style={listPosition}>
          {listContent}
        </div>
      )}
    </div>
  );
};

export default Profile;

------------------------------------------------

// Profile.jsx
import { useState } from "react";
import AvatarCroppingPopup from "./AvatarCroppingPopup";

const Profile = ({ isProfileOpen, setIsProfileOpen }) => {
  const [isListVisible, setIsListVisible] = useState(false);
  const [listPosition, setListPosition] = useState(null);
  const [isAvatarViewed, setIsAvatarViewed] = useState(false);
  const [isCroppingPopupOpen, setIsCroppingPopupOpen] = useState(false);
  const authUser = useSelector((state) => state.user.authUser) ?? {};
  const avatarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setIsListVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleCloseProfile = () => setIsProfileOpen((prev) => !prev);

  const handleAvatarClick = (e) => {
    if (isProfileOpen) {
      setIsListVisible((prev) => !prev);
      const { clientX, clientY } = e.nativeEvent;
      setListPosition({
        left: Math.min(clientX - 10),
        top: clientY - 10,
      });
    }
  };

  const handleViewAvatar = () => {
    setIsAvatarViewed((prev) => !prev);
  };

  const handleAvatarChange = () => {
    setIsCroppingPopupOpen(true);
  };

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
        {isAvatarViewed ? (
          <div
            className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-75"
            onClick={handleViewAvatar}
          >
            <Avatar
              ref={avatarRef}
              className="cursor-pointer aspect-square size-[30rem]"
              onClick={handleAvatarClick}
            >
              <AvatarImage src={authUser?.avatar} alt="avatar" />
              <AvatarFallback className="bg-[#181C1F] aspect-square text-3xl font-semibold">
                {authUser?.userName?.slice(0, 2).toUpperCase() ?? "CN"}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <section className="bg-green-500 flex flex-col justify-center items-center gap-3">
            <Avatar
              ref={avatarRef}
              className={`cursor-pointer w-[55%] h-[55%] ${
                isAvatarViewed ? "" : "rounded-full"
              }`}
              onClick={handleAvatarClick}
            >
              <AvatarImage src={authUser?.avatar} alt="avatar" />
              <AvatarFallback className="bg-[#181C1F] aspect-square text-3xl font-semibold">
                {authUser?.userName?.slice(0, 2).toUpperCase() ?? "CN"}
              </AvatarFallback>
            </Avatar>

            <ImageCropper />
          </section>
        )}

        <section className="bg-blue-600 mt-3">
          <div>
            <h2>Username</h2>
          </div>
        </section>
      </main>

      {isCroppingPopupOpen && (
        <AvatarCroppingPopup
          avatarSrc={authUser.avatar}
          onClose={() => setIsCroppingPopupOpen(false)}
          onCropComplete={() => {
            // Perform backend API call to change avatar
            // Close cropping popup
            setIsCroppingPopupOpen(false);
          }}
        />
      )}

      {isListVisible && (
        <div className="absolute" style={listPosition}>
          {listContent}
        </div>
      )}
    </div>
  );
};

export default Profile;


------------------------------------------------









my old garbage code of Register.jsx

only jsx code which has the form and shandcn and now you will look how it's looking clean and readable

---------------
return (
    
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle className="font-[700] text-3xl">Register</CardTitle>
          <CardDescription className="text-sm">
            create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitHandler}>
            <div className="grid w-full items-center gap-4">
              {/* USERNAME */}
              <div className="flex flex-col space-y-1.5">
                <Label className="cursor-pointer" htmlFor="userName">
                  Username
                </Label>
                <Input
                  value={user.userName}
                  onChange={onChangeHandler}
                  id="userName"
                  name="userName"
                  placeholder="Username"
                  className=""
                />
              </div>
              {/* FULL NAME */}
              <div className="flex flex-col space-y-1.5">
                <Label className="cursor-pointer" htmlFor="full-name">
                  Full Name
                </Label>
                <Input
                  value={user.fullName}
                  onChange={onChangeHandler}
                  id="full-name"
                  name="fullName"
                  placeholder="Full Name"
                />
              </div>
              {/* EMAIL */}
              <div className="flex flex-col space-y-1.5">
                <Label className="cursor-pointer" htmlFor="email">
                  Email
                </Label>
                <Input
                  type={"email"}
                  value={user.email}
                  onChange={onChangeHandler}
                  id="email"
                  name="email"
                  placeholder="Email"
                />
              </div>
              {/* AVATAR */}
              <div className="flex justify-center items-center space-y-1.5">
                <Label className="cursor-pointer" htmlFor="avatar">
                  Avatar
                </Label>
                <Input
                  type={"file"}
                  className="border-transparent shadow-transparent"
                  // value={user.avatar}
                  onChange={onChangeHandler}
                  // accept="image/png, image/jpeg
                  accept={"image/*"}
                  id="avatar"
                  name="avatar"
                  placeholder="Avatar"
                />
              </div>
              {/* PASSWORD */}
              <div className="flex flex-col space-y-1.5">
                <Label className="cursor-pointer" htmlFor="password">
                  Password
                </Label>
                  <Input
                    type={"password"}
                    onChange={onChangeHandler}
                    value={user.password}
                    id="password"
                    name="password"
                    placeholder="Password"
                  />
              </div>
              {/* SUBMIT */}
              <Button type="submit" className="w-full">
                Register
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between -mt-5 flex-col">
          <Link to={"/login"} className="text-sm hover:underline">
            Already have an account? Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
---------------

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { setAuthUser } from "../redux/userSlice";
import { userRoutes } from "../constants";
import CardWrapper from "../utils/CardWrapper";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [user, setUser] = useState({
    fullName: "",
    userName: "",
    email: "",
    avatar: undefined,
    password: "",
  });

  const onChangeHandler = (e) => {
    const { name, value, files } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: name === "avatar" ? files[0] : value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
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
      };

      const response = await axios.post(userRoutes.register, formData, options);
      const authUser = response?.data?.data;

      if (!authUser || !(authUser instanceof Object)) {
        toast.error("Failed To Show Your Avatar!");
      }

      if (response.data.success) {
        dispatch(setAuthUser(authUser));
        toast.success(response.data.message);
        navigate("/");
      }
    } catch (error) {
      if (error.response && error.response.status > 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An Error Occurred. Try Again Later!");
      }
    }
  };

  const inputFields = [
    {
      name: "userName",
      label: "Username",
      type: "text",
      value: user.userName,
      onChange: onChangeHandler,
      placeholder: "Username",
      className: "",
    },
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      value: user.fullName,
      onChange: onChangeHandler,
      placeholder: "Full Name",
      className: "",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      value: user.email,
      onChange: onChangeHandler,
      placeholder: "Email",
      className: "",
    },
    {
      name: "avatar",
      label: "Avatar",
      type: "file",
      value: user.avatar,
      onChange: onChangeHandler,
      placeholder: "Avatar",
      className: "border-transparent shadow-transparent",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      value: user.password,
      onChange: onChangeHandler,
      placeholder: "Password",
      className: "",
    },
  ];

  const footerContent = <button type="submit">Register</button>;

  return (
    <CardWrapper
      outerStyle="flex justify-center items-center h-screen"
      title="Register"
      titleLabel="create your account"
      footerContent={footerContent}
      inputFields={inputFields}
      onSubmit={onSubmitHandler}
    >
      <Link to="/login" className="text-sm hover:underline">
        Already have an account? Login
      </Link>
    </CardWrapper>
  );
};

export default Register;

-------------------------------PROFILE.JSX
import { useSelector } from "react-redux";
import { IoArrowBackSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import ImageCropper from "./ImageCropper";
import { constantValues } from "../constants";
import { useState } from "react";

import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"

const Profile = ({ isProfileOpen, setIsProfileOpen }) => {
  const [editAvatar, setEditAvatar] = useState(false);
  const [showList, setShowList] = useState(false); // State to control list visibility
  const [listLeft, setListLeft] = useState(null); // State to store list left position
  const [listTop, setListTop] = useState(null); // State to store list top position
  const [listBoxWidth, setListBoxWidth] = useState(150); // Fixed list box width

  const handleCloseProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const authUser = useSelector((state) => state.user.authUser);

  const onOpenedProfileAvatarCilckHandler = (e) => {
    if (isProfileOpen && e.target.currentSrc === authUser.avatar) {
      setEditAvatar((prev) => !prev);
      setShowList((prev) => !prev); // Toggle list visibility on click

      // Calculate list position based on click coordinates with a maximum width constraint
      const { clientX, clientY } = e.nativeEvent;
      const maxWidth = window.innerWidth - clientX - 10; // Account for screen width and offset
      setListLeft(Math.min(clientX + 10, maxWidth)); // Ensure list stays within screen bounds
      setListTop(clientY + 10);
    }
  };

  const listContent = (
    <div
      className="bg-slate-700 shadow-md rounded-md p-2"
      style={{ maxWidth: `${listBoxWidth}px` }} // Set fixed width for list box
    >
      {/* List items as buttons */}
      <button className="w-full mb-1 text-left">View Photo</button>
      <button className="w-full mb-1 text-left">Take Photo</button>
      <button className="w-full mb-1 text-left">Upload Photo</button>
      <button className="w-full text-left">Remove Photo</button>
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
            className="cursor-pointer w-[55%] h-[55%] rounded-full"
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

      {showList && ( // Conditionally render the list based on showList state
        <div
          className="absolute left-most top-most" // Adjust positioning as needed
          style={{ left: `${listLeft}px`, top: `${listTop}px` }}
        >
          {listContent}
        </div>
      )}
    </div>
  );
};

export default Profile;

