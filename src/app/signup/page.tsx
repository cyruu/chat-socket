"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { notify } from "@/index";
import { useRouter } from "next/navigation";
import { TextField, Button, Avatar } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import HttpsOutlinedIcon from "@mui/icons-material/HttpsOutlined";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import Link from "next/link";
import axios from "axios";
import { LoadingButton } from "@mui/lab";

const SignupPage = () => {
  const router = useRouter();
  const [loading, setloading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [selectedImage, setSelectedImage] = useState<any>(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // Create a preview URL for the image
    }
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setloading(true);
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
    setloading(false);
  };

  return (
    <div className="flex justify-center items-center w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white py-9 px-5 w-[90%] rounded-xl
        shadow-md md:w-[37%] md:py-12 md:px-7 xl:w-[30%]
        "
      >
        <p className="w-max mx-auto text-4xl font-bold mb-7 ">Chat.io</p>
        <div className="preview-img relative w-[120px] flex justify-center items-center h-[120px] mx-auto rounded-full mb-6">
          <Avatar
            src={selectedImage || ""}
            sx={{ height: "100%", width: "100%" }}
          ></Avatar>
          <label
            htmlFor="imginput"
            className="bg-white p-2 rounded-full border-2 cursor-pointer border-gray-300  absolute bottom-0 right-0"
          >
            <AddAPhotoIcon sx={{ fontSize: "1.2rem", color: "gray" }} />
          </label>
          <input
            accept="image/*"
            onChange={handleFileChange}
            type="file"
            id="imginput"
            className="hidden"
          />
        </div>

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
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? (
                      <Visibility sx={{ fontSize: "1rem" }} />
                    ) : (
                      <VisibilityOff sx={{ fontSize: "1rem" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
        {!loading ? (
          <Button variant="contained" className="w-full " type="submit">
            Sign up
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
            <span className="">Sign up</span>
          </LoadingButton>
        )}
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
