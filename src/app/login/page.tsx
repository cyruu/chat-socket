"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { notify } from "@/index";
import { useRouter } from "next/navigation";
import { TextField, Button } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import HttpsOutlinedIcon from "@mui/icons-material/HttpsOutlined";
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
    <div className=" flex justify-center items-center w-full ">
      <form
        onSubmit={handleSubmit}
        className="bg-white py-9 px-5 w-[90%] rounded-xl
        shadow-md md:w-[37%] md:py-12 md:px-7 xl:w-[30%]
        "
      >
        <p className="w-max mx-auto text-4xl font-bold mb-7">Chat.io</p>

        <div className="user-item flex items-end mb-5">
          <PersonOutlineOutlinedIcon className="text-4xl text-gray-400 mr-2" />
          <TextField
            variant="standard"
            label="Username"
            color="primary"
            className="w-full"
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="user-item flex items-end mb-7">
          <HttpsOutlinedIcon className="text-3xl text-gray-400 mr-2" />
          <TextField
            variant="standard"
            label="Password"
            color="primary"
            className="w-full"
            type="password"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button variant="contained" className="w-full " type="submit">
          Login
        </Button>
        <p className="text-sm mt-4">
          New here?
          <Link href="/signup" className="text-blue-500 underline ml-1">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
