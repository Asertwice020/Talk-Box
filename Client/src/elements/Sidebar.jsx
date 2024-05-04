import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { IoIosSearch } from "react-icons/io";
import { IoFilterSharp } from "react-icons/io5";
import { useState } from "react";
import Profile from "./Profile";
import { colorCodes } from "../constants";

const Sidebar = () => {
  const authUser = useSelector((state) => state.user.authUser) ?? {};
  // LOG
  console.log({authUser})

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleProfileOpening = () => {
    setIsProfileOpen((prevState) => !prevState);
  };

  return (
    <div className="bg-slate-900 min-w-[25rem] h-full relative overflow-hidden rounded">
      <header className="bg-[#202C33] px-4 py-2">
        <Avatar className="cursor-pointer" onClick={handleProfileOpening}>
          <AvatarImage src={authUser.avatar} alt="avatar" />
          <AvatarFallback
            // className={`bg-[${colorCodes.avatarDefault}] text-white`}
            className={`bg-[#6A7175] text-white`}
          >
            {authUser?.userName?.slice(0, 2).toUpperCase() ?? "CN"}
          </AvatarFallback>
        </Avatar>

        {isProfileOpen && (
          <Profile
            setIsProfileOpen={setIsProfileOpen}
            isProfileOpen={isProfileOpen}
          />
        )}
      </header>

      <main className="flex px-4 py-2 bg-[#202C33] mt-1">
        {/* Search Container */}
        <Label type="submit" htmlFor="search" className="flex w-full">
          <div className="flex justify-center items-center px-2 ">
            <IoIosSearch />
          </div>
          <form className="w-full">
            <Input id="search" placeholder="Search" className="w-full" />
          </form>
        </Label>
        <div className="flex justify-center items-center pl-2">
          <IoFilterSharp />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
