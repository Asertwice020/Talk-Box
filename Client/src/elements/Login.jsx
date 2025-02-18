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
    const { name, value } = e.target;
    setloginData({ ...loginData, [name]: value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // CLIENT-SIDE VALIDATION - ( BY THIS VALIDATION WE SAVE AN UNNECESSARY API CALL )
    if (!loginData.usernameOrEmail.trim() || !loginData.password.trim()) {
      toast.error("Please Enter Your Login Credentials!");
      return;
    }

    try {
      const options = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      const response = await axios.post(userRoutes.login, loginData, options)

      const { user: authUser, accessToken, refreshToken } = response.data.data;

      if (!authUser && !(authUser instanceof Object)) {
        toast.error("Failed to show your Avatar!");
        return;
      }

      if (response.status === 200) {
        // STORE: ACCESS & REFRESH TOKENS SECURELY ( HTTP-ONLY COOKIES || LOCAL-STORAGE )
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        dispatch(setAuthUser(authUser));
        toast.success(response.data.message);
        navigate("/");
      } else {
        toast.error("Invalid username/email or password.");
      }
      
    } catch (error) {
      console.log({error})
    }
  }
  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[350px]">
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