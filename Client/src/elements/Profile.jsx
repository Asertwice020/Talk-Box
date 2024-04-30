import { useSelector } from "react-redux";
import { IoArrowBackSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import ImageCropper from './ImageCropper'

const Profile = ({ setIsProfileOpen }) => {
  const handleCloseProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const authUser = useSelector((state) => state.user.authUser);
  // LOG
  console.log({ AUTHUSER: authUser });

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
      
      <main className="flex flex-col justify-between h- gap-1">
        <ImageCropper />
        <section className="bg-red-500 block h-[50%]">sdgsg</section>
        
        {/* 2 */}
        <section className="bg-teal-500">sgds</section>
      </main>

      {/* <main className="flex flex-col gap-1">
        <section className="h-1/2">
          <Avatar
            className="relative cursor-pointer w-[50%] h-[50%] bg-white"
            // onClick={handleProfileOpening}
          >
            <AvatarImage
              src={authUser?.avatar}
              className="hover:bg-[#000000a0]"
              alt="avatar"
            />
            <AvatarFallback className="bg-[#181C1F]">
              {authUser?.userName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </section>

        {/* 2 */}
        {/* <section className=" flex flex-col gap-5 w-full px-2 text-[#008052]">
          <div className="flex flex-col gap-4">
            <h2 className="font-[300]">Your Username</h2>
            <p>{authUser?.userName}</p>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-[300]">Your Email</h2>
            <p>{authUser?.email}</p>
          </div>
        </section> */}
      {/* </main> */}

      {/* <main className="flex flex-col gap-5 items-center p-6"></main> */}
    </div>
  );
};

export default Profile