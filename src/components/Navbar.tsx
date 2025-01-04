"use client";
import Link from "next/link";
import React from "react";
import { Button } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
const Navbar = () => {
  const { data: sessionData, status } = useSession();

  return (
    <div className="w-full flex justify-evenly">
      {sessionData ? (
        <>
          <Link href="/">home</Link>
          <Link href="/about">about</Link>

          <Button variant="contained" onClick={() => signOut()}>
            logout
          </Button>
        </>
      ) : (
        <Link href="/login">
          <Button variant="contained">Login</Button>
        </Link>
      )}
    </div>
  );
};

export default Navbar;
