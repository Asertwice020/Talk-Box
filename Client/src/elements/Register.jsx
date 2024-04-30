import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userRoutes } from "../constants"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { setAuthUser } from "../redux/userSlice";

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

  // useEffect(() => {
  //   // Clear form data if submission is complete
  //   if (!submitting) {
  //     setUser({
  //       fullName: "",
  //       userName: "",
  //       email: "",
  //       avatar: undefined,
  //       password: "",
  //     });
  //   }
  // }, [submitting]);

  const onChangeHandler = (e) => {
    const { name, value, files } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: name === "avatar" ? files[0] : value, // Update avatar separately
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    // if (submitting) return;
    // setSubmitting(true); // Set form submission state to true

    try {
      // LOG
      // console.log(user);

      const formData = new FormData();
      formData.append("userName", user.userName);
      formData.append("fullName", user.fullName);
      formData.append("email", user.email);
      formData.append("avatar", user.avatar); // Append the avatar file
      formData.append("password", user.password);

      // LOG
      // console.log({formData})

      const res = await axios.post(userRoutes.register, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      // LOG
      console.log({fullResponse: res});

      const authUser = res?.data?.data;

      if (!authUser && !(authUser instanceof Object)) {
        toast.error("Failed to show your Avatar!");
      }

      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setAuthUser(authUser));
        navigate("/");
      }
    } catch (error) {
      if (error.response && error?.response?.status > 400) {
        toast.error(error?.response?.data?.message);
      } else {
        console("Error:", error);
        toast.error("An error occurred. Please try again later.");
      }
    } 
    // finally {
    //   setSubmitting(false); // Reset form submission state
    // }
  };
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
};

export default Register;