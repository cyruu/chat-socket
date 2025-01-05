"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { notify } from "@/index";
import { useRouter } from "next/navigation";
import { TextField, Button } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import HttpsOutlinedIcon from "@mui/icons-material/HttpsOutlined";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import Link from "next/link";

const SignupPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const resData = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });
    if (resData?.error) {
      notify(resData?.error, resData?.status);
      return;
    }
    notify("Login success", resData?.status);
    setTimeout(() => {
      router.push("/");
    }, 1700);
  };

  return (
    <div className="h-[80vh] flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white py-9 px-4 w-[90%] rounded-xl
        shadow-md md:w-[30%] md:py-12 md:px-7
        "
      >
        <p className="w-max mx-auto text-4xl font-bold mb-7">Chat.io</p>

        <div className="user-item flex items-end mb-5">
          <AlternateEmailOutlinedIcon className="text-3xl text-gray-400 mr-2" />
          <TextField
            variant="standard"
            label="Email"
            color="primary"
            className="w-full"
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="user-item flex items-end mb-5">
          <PersonOutlineOutlinedIcon className="text-3xl text-gray-400 mr-2" />
          <TextField
            variant="standard"
            label="Username"
            color="primary"
            className="w-full"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="user-item flex items-end mb-7">
          <HttpsOutlinedIcon className="text-3xl text-gray-400 mr-2" />
          <TextField
            variant="standard"
            label="Password"
            color="primary"
            className="w-full"
            size="small"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button variant="contained" className="w-full ">
          Sign up
        </Button>
        <p className="text-sm mt-4">
          Ready to log in?
          <Link href="/login" className="text-blue-500 underline ml-1">
            Let&apos;s Get You In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
