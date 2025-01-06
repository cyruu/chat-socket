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
import axios from "axios";

const SignupPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { data: resData } = await axios.post("api/users/signup", {
      username,
      email,
      password,
    });
    notify(resData.msg, resData?.statusCode);
    if (resData.statusCode != 200) {
      return;
    }

    setTimeout(() => {
      router.push("/login");
    }, 1700);
  };

  return (
    <div className="flex justify-center items-center w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white py-9 px-5 w-[90%] rounded-xl
        shadow-md md:w-[37%] md:py-12 md:px-7 xl:w-[30%]
        "
      >
        <p className="w-max mx-auto text-4xl font-bold mb-7">Chat.io</p>

        <div className="user-item flex items-end mb-5">
          <AlternateEmailOutlinedIcon className="text-3xl text-gray-400 mr-2" />
          <TextField
            variant="standard"
            label="Email"
            color="primary"
            type="email"
            className="w-full"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            size="small"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button variant="contained" className="w-full " type="submit">
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
