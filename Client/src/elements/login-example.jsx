import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userRoutes } from "../constants";

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

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginData, setloginData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    console.log("Event triggered:", e);
    const { name, value } = e.target;
    setloginData({ ...loginData, [name]: value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", loginData);

    // CLIENT-SIDE VALIDATION - ( BY THIS VALIDATION WE SAVE AN UNNECESSARY API CALL )
    if (!loginData.usernameOrEmail.trim() || !loginData.password.trim()) {
      toast.error("Please Enter Your Login Credentials!");
      return;
    }
    try {
      // let loginData = {
      //   usernameOrEmail: user.usernameOrEmail,
      //   password: user.password,
      // };
      // const response = await axios.post(userRoutes.login, loginData, {
      //   headers: {
      //     // "Content-Type": "multipart/form-data",
      //     "Content-Type": "application/json",
      //   },
      //   withCredentials: true,
      // });

      const response = await axios.post(userRoutes.login, loginData, {
        headers: {
          "Content-Type": "application/json", // Set appropriate content type
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        const { user: loggedInUser, accessToken, refreshToken } = response.data;

        // STORE: ACCESS & REFRESH TOKENS SECURELY ( HTTP-ONLY COOKIES || LOCAL-STORAGE )
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        dispatch(setAuthUser(loggedInUser));
        toast.success(response.data.message);
        navigate("/");
      } else {
        toast.error("Invalid username/email or password.");
      }

      // const authUser = res?.data?.data?.user;

      // if (!authUser && !(authUser instanceof Object)) {
      //   toast.error("Failed To Retrieve User Data!");
      // }

      // if (res.data.success) {
      //   toast.success(res.data.message);
      //   dispatch(setAuthUser(authUser));
      //   navigate("/");
      // }

      // // HANDLE SPECIFIC ERROR CODES
      // res.status === 401 && toast.error("Invalid Credentials");
      // res.status === 400
      //   ? toast.error("Invalid request data")
      //   : toast.error("An error occurred");
    } catch (error) {
      console.error(error);

      // HANDLE NETWORK ERRORS
      if (error.response) {
        error.response.status === 0
          ? toast.error("Please Check Your Internet Connection⚠️")
          : toast.error("An error occurred");
      }
    }
  };
  return (
    <div className="flex justify-center items-center h-screen bg-slate-800">
      <Card className="w-[350px] bg-gray-600">
        <CardHeader className="text-center">
          <CardTitle className="font-[700] text-3xl">Login</CardTitle>
          <CardDescription className="text-sm">
            login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitHandler}>
            <div className="grid w-full items-center gap-4">
              {/* USERNAME */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="usernameOrEmail">Username Or Email</Label>
                <Input
                  value={loginData.usernameOrEmail}
                  onChange={onChangeHandler}
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  placeholder="Username or Email"
                />
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  // type={"password"}
                  onChange={onChangeHandler}
                  value={loginData.password}
                  id="password"
                  name="password"
                  placeholder="Password"
                />
              </div>
              {/* SUBMIT */}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between -mt-5 flex-col">
          <Link to={"/register"} className="text-sm hover:underline">
            do not have an account? Register
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
