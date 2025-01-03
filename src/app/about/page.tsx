"use client";
import React from "react";
import { useSelector } from "react-redux";

const page = () => {
  const stateCount = useSelector((state: any) => state.count);
  const countLoading = useSelector((state: any) => state.countLoading);
  return (
    <div>
      <p>About page</p>
      <p>state count {stateCount}</p>
    </div>
  );
};

export default page;
