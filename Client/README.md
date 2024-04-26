# TALKBOX - CHAT APP

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (submitting) return;
    setSubmitting(true); // Set form submission state to true

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
      console.log(res);

      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setAuthUser(res.data.data.user));
        navigate("/");
      }
    } catch (error) {
      if (error.response && error?.response?.status > 400) {
        toast.error(error?.response?.data?.message);
      } else {
        console("Error:", error);
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      setSubmitting(false); // Reset form submission state
    }
  };

    // const isEmpty = Object.values(user).some((value) => value.trim() === "");
    // console.log(isEmpty)
    // if (isEmpty) {
    //   toast.error("All Fields Are Required2!");
    //   return
    // }

const onSubmitHandler = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append("userName", user.userName);
    formData.append("fullName", user.fullName);
    formData.append("email", user.email);
    formData.append("avatar", user.avatar); // Append the avatar file
    formData.append("password", user.password);

    const res = await axios.post(
      userRoutes.register,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Use multipart/form-data for file upload
        },
        withCredentials: true,
      }
    );
    console.log(res);
  } catch (error) {
    console.log(error);
  }
};





import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CardWithForm() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your project" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Framework</Label>
              <Select>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="sveltekit">SvelteKit</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  )
}
