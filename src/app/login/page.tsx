"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { notify } from "@/index";
import { useRouter } from "next/navigation";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import HttpsOutlinedIcon from "@mui/icons-material/HttpsOutlined";
import Link from "next/link";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { LoadingButton } from "@mui/lab";

const LoginPage = () => {
  const router = useRouter();
  const [loading, setloading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setloading(true);
    const resData = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });
    if (resData?.error) {
      notify(resData?.error, resData?.status);
      setloading(false);
      return;
    }
    notify("Login success", resData?.status);
    setTimeout(() => {
      router.push("/");
    }, 1700);
    setloading(false);
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
            type={showPassword ? "text" : "password"}
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? (
                      <Visibility
                        sx={{ fontSize: "1rem", marginRight: ".5rem" }}
                      />
                    ) : (
                      <VisibilityOff
                        sx={{ fontSize: "1rem", marginRight: ".5rem" }}
                      />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
        {!loading ? (
          <Button variant="contained" className="w-full " type="submit">
            Login
          </Button>
        ) : (
          <LoadingButton
            size="large"
            color="error"
            loading={loading}
            loadingPosition="end"
            variant="contained"
            className="w-full"
          >
            <span className="">Login</span>
          </LoadingButton>
        )}
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
