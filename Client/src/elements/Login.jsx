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

  const [user, setUser] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      // LOG
      // console.log(user);

      const res = await axios.post(userRoutes.login, user, {
        headers: {
          // "Content-Type": "multipart/form-data",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      // LOG
      console.log(res);
      
      const authUser = res?.data?.data?.user;

      if ( !authUser && !(authUser instanceof Object)) {
        toast.error("Failed to show your Avatar!")
      }

      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setAuthUser(authUser))
        // LOG
        // const reduxData = dispatch(setAuthUser(res.data.data.user))
        // console.log({reduxData})
        navigate("/");
      }
    } catch (error) {
      console.log(error);

      // TODO: ADD ANOTHER TOAST FOR "INTERNET CONNECTION ERROR AFTER READING AXIOS DOCS"
      
      if (error.response.status === 500) {
        toast.error("Internal Server Error!");
      } 

    }
    // THIS CODE RUN EVEN ERROR OCCURS!!!
    setUser({
      userName: "",
      email: "",
      password: "",
    });
  };
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
                <Label htmlFor="userName">Username</Label>
                <Input
                  value={user.userName}
                  onChange={onChangeHandler}
                  id="userName"
                  name="userName"
                  placeholder="Username or Email"
                />
              </div>
              {/* EMAIL */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  type={"email"}
                  value={user.email}
                  onChange={onChangeHandler}
                  id="email"
                  name="email"
                  placeholder="Email"
                />
              </div>
              {/* PASSWORD */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  // type={"password"}
                  onChange={onChangeHandler}
                  value={user.password}
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