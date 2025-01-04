"use client";
import { settemp } from "@/redux/socketSlice";
import Link from "next/link";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const Navbar = () => {
  const dis = useDispatch();
  const temp = useSelector((state: any) => state.temp);
  async function apiCall() {
    await new Promise((res, rej) => {
      setTimeout(() => {
        res("sd");
      }, 1000);
    });
    dis(settemp({ value: 1000 }));
  }
  useEffect(() => {
    apiCall();
  }, []);
  return (
    <div>
      <Link href="/about">about</Link>
      <Link href="/login">login</Link>
      <Link href="/">home</Link>
      <div>{temp ? <p>temp : {temp.value}</p> : <p>no temp value</p>}</div>
    </div>
  );
};

export default Navbar;
