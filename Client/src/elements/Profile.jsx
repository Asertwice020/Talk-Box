import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { IoArrowBackSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
// import ImageCropper from "./ImageCropper";
// import { userRoutes } from "../constants";
import AvatarCroppingPopup from "./AvatarCroppingPopup";
import { saveAs } from "file-saver";
import { colorCodes } from "../constants";
import { HiPencil } from "react-icons/hi2";
import { BsEmojiLaughing } from "react-icons/bs"; // emoji icon
import { TiTick } from "react-icons/ti"; // tick icon

const Profile = ({ isProfileOpen, setIsProfileOpen }) => {
  const [isListVisible, setIsListVisible] = useState(false);
  const [listPosition, setListPosition] = useState(null);
  const [isAvatarViewed, setIsAvatarViewed] = useState(false); // New state variable
  const [isCroppingPopupOpen, setIsCroppingPopupOpen] = useState(false);
  const authUser = useSelector((state) => state.user.authUser) ?? {};
  const avatarRef = useRef(null);
  const handleCloseProfile = () => setIsProfileOpen((prev) => !prev);
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    userName: "",
    about: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: name === "avatar" ? files[0] : value, // UPDATE AVATAR SEPARATELY
    }));
  };

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
    setIsAvatarViewed((prev) => !prev); // Toggle full-screen view
  };

  const avatarChangeHandler = () => {
    setIsCroppingPopupOpen(true); // Open the cropping popup
  };
  
  const downloadAvatarHandler = () => {
    // 1. FETCH: AVATAR
    fetch(authUser.avatar)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network Response Was Not OK");
        }
        return response.blob();
      })
      .then((blob) => {
        // 2. SAVE: BLOB AS A FILE WITH FILE-SAVER (PKG)
        saveAs(blob, "avatar.png"); // DEFAULT NAME
      })
      .catch((error) => {
        console.error("There Was A Problem With The Download\n", error);
      });
  };

  const handleButtonClick = (buttonText) => {
    switch (buttonText) {
      case "View Photo":
        handleViewAvatar();
        break;
      case "Change Photo":
        avatarChangeHandler();
        break;
      case "Download Photo":
        downloadAvatarHandler();
        break;
      default:
        break;
    }
  };

  const listButtons = [
    "Download Photo",
    "View Photo",
    "Alter Photo",
    "Remove Photo",
  ];


  const listContent = (
    <div
      className="bg-slate-700 shadow-md rounded-md py-2 flex flex-col justify-center items-center"
      // style={{ width: "150px" }}
    >
      {listButtons.map((buttonText, index) => (
        <button
          key={index}
          className={`w-full text-left py-2 px-5 text-sm hover:bg-slate-800 ${
            // Added condition to add disabled style
            (buttonText === "View Photo" || buttonText === "Download Photo") &&
            !authUser.avatar
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={() => handleButtonClick(buttonText)}
          // CONDITIONALLY RENDER: DISABLED ATTRIBUTE
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
        {isAvatarViewed ? ( // Conditionally render full-screen avatar
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
              <AvatarFallback
                // className={`bg-[${colorCodes.avatarDefault}] aspect-square text-3xl font-semibold`}
                className={`bg-[#6A7175] aspect-square text-3xl font-semibold`}
              >
                {authUser?.userName?.slice(0, 2).toUpperCase() ?? "CN"}
              </AvatarFallback>
            </Avatar>
          </div>
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
              <AvatarFallback
                // className={`bg-[${colorCodes.avatarDefault}] aspect-square text-3xl font-semibold`}
                className={`bg-[#6A7175] aspect-square text-3xl font-semibold`}
              >
                {authUser?.userName?.slice(0, 2).toUpperCase() ?? "CN"}
              </AvatarFallback>
            </Avatar>

            {/* <ImageCropper /> */}
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
                    setUserDetails({
                      ...userDetails,
                      userName: e.target.value,
                    });
                  }}
                />
                {/* Render pencil icon when not editing */}
                {!userDetails.userName && (
                  <HiPencil
                    className="text-[#008052] cursor-pointer"
                    onClick={() => {
                      setUserDetails({
                        ...userDetails,
                        userName: authUser?.userName,
                      });
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
            {/* 2 */}
            <div>
              <p>Username</p>
              <input
                type="text"
                value={authUser?.userName}
                className="bg-black text-white"
              />
              <button>
                <HiPencil />
              </button>
            </div>
          </form>
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