"use client";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

const Navbar = () => {
  const loggedInUser = useSelector((state: any) => state.loggedInUser);
  return (
    <div style={{ height: "20vh" }}>
      <Link href="/">Home</Link>
      <br />
      <Link href="/about">About</Link>
    </div>
  );
};

export default Navbar;
