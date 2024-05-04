// ################## REGISTER.JSX ################

import { Button } from "../components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userRoutes } from "../constants"
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { setAuthUser } from "../redux/userSlice";
import CardWrapper from "../utils/CardWrapper";
import { CardFooter } from "../components/ui/card";

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
      [name]: name === "avatar" ? files[0] : value, // UPDATE AVATAR SEPARATELY
    }));
  };

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
  
  return (
    <CardWrapper
      outerStyle="flex justify-center items-center h-screen"
      title="Register"
      titleLabel="create your account"
      inputFields={inputFields}
      onSubmit={onSubmitHandler}
      children={}
    >
      <CardFooter className="flex justify-between -mt-5 flex-col">
        <Button type="submit" onSubmit={onSubmitHandler} className="w-full">Register</Button>
        <Link to={"/login"} className="text-sm hover:underline">
          Already have an account? Login
        </Link>
      </CardFooter>
    </CardWrapper>
  );
};

export default Register;


// ################## CARD-WRAPPER.JSX ################

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import InputWrapper from "./InputWrapper"

const CardWrapper = ({
  outerStyle,
  title,
  titleLabel,
  inputFields,
  // onSubmit,
  children,
}) => {
  // IF ON SUBMIT FUNCTION PROVIDED
  // onSubmit && 
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (onSubmit) {
  //     onSubmit();
  //   }
  // };

  return (
    <div className={outerStyle}>
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle className="font-[700] text-3xl">{title}</CardTitle>
          <CardDescription className="text-sm">{titleLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {inputFields.map((field, index) => (
              <InputWrapper key={index} field={field} /> // Render input fields using InputWrapper
            ))}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between -mt-5 flex-col">
          {footerContent}
          {children}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CardWrapper;


// ################## INPUT-WRAPPER.JSX ################

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useState } from "react";

const InputWrapper = ({ field }) => {
  const { type, value, onChange, id, name, label, placeholder, className } =
    field;
    
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log({selectedFile})
    setFile(selectedFile);
    field.onChange({
      target: {
        name: field.name,
        value: selectedFile,
      },
    });
  };


  // if (type === "file") {
  //   return (
  //     <div className="flex flex-col space-y-1.5">
  //       <Label className="cursor-pointer" htmlFor={id}>
  //         {label}
  //       </Label>
  //       <input
  //         type={type}
  //         onChange={onChange} // Use the provided onChange function directly
  //         id={id}
  //         name={name}
  //         className={className}
  //       />
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col space-y-1.5">
      <Label className="cursor-pointer" htmlFor={id}>
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        id={id}
        name={name}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
};

export default InputWrapper;









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
      console.log({ fullResponse: res });

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







// -------------------------------------
{listButtons.map((buttonText, index) => (
  <button
    key={index}
    className="w-full text-left py-2 px-5 text-sm hover:bg-slate-800"
    onClick={() => buttonText === "View Photo" ? handleViewAvatar() : buttonText === "Change Photo" ? handleAvatarClick({ target: { currentSrc: authUser.avatar } }) : null}
  >
    {buttonText}
  </button>
))}
