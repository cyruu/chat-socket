"use client";
import { setAllConnectedUsers } from "@/redux/chatSlice";
import { setSocket } from "@/redux/socketSlice";
import { Avatar, Button } from "@mui/material";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import TextsmsIcon from "@mui/icons-material/Textsms";

const page = () => {
  const { data: sessionData, status } = useSession();
  const dis = useDispatch();
  const socket = useSelector((state: any) => state.socketReducer.socket);
  const allConnectedUsers = useSelector(
    (state: any) => state.chatReducer.allConnectedUsers
  );

  // state variables
  const [selectedMenu, setselectedMenu] = useState("active");

  useEffect(() => {
    const clientSocket = io();
    // on socket connection
    clientSocket.on("connect", () => {
      // send session data to server
      if (sessionData) {
        clientSocket.emit("user-connected", sessionData);
      }
      // set redux socket to connected socket
      dis(
        setSocket({ id: clientSocket.id, connected: clientSocket.connected })
      );

      // initially get all connected users
      clientSocket.on("connected-users", (connectedUsers: String[]) => {
        dis(setAllConnectedUsers(connectedUsers));
      });
    });
    return () => {
      clientSocket?.disconnect();
    };
  }, [sessionData?.user]);

  if (!socket || status == "loading") return <p>Loading..</p>;
  return (
    <div className="chat-bar h-[100dvh] px-5">
      {/* chat-header */}
      <div className="chat-bar-header h-[10dvh] flex items-center justify-between">
        <p className="text-3xl font-bold ">Chat.io</p>
        <Button>
          <ExitToAppIcon sx={{ color: "black" }} />
        </Button>
      </div>
      {/* your info */}
      <div className="your-info flex">
        <div className="avatar-container relative ">
          <span className="absolute z-20 h-[8px] w-[8px] bg-green-500 bottom-0 left-0 rounded-full"></span>
          <Avatar
            sx={{ height: "3.5rem", width: "3.5rem" }}
            className="bg-red-200 border-2 border-green-600"
            src="https://scontent.fktm19-1.fna.fbcdn.net/v/t39.30808-1/440571631_3660838454174508_7761877485988410125_n.jpg?stp=c34.95.185.185a_dst-jpg_p240x240_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_ohc=xAi1HTjeLp8Q7kNvgH9_il0&_nc_zt=24&_nc_ht=scontent.fktm19-1.fna&_nc_gid=AmcnuchHXyyopIJX_UWHexM&oh=00_AYCsx8YDzWp8IU0dA9_W9W_JjskQonI2DaS09MgtgT2RGg&oe=67805C02"
          />
        </div>
        <div className="info ml-3">
          <p className="text-lg">{sessionData?.user?.username}</p>
          <p className="text-xs text-gray-500">{sessionData?.user?._id}</p>
        </div>
      </div>
      {/* menu-tabs */}
      <div className="menu-tabs flex justify-around bg-gray-300 items-center h-[6dvh] my-4 rounded-full">
        <button
          onClick={() => setselectedMenu("chats")}
          className="text-xs bg-white px-4 py-1 rounded-xl text-black shadow-md"
        >
          Chats
        </button>
        <button
          onClick={() => setselectedMenu("active")}
          className="text-xs bg-white px-4 py-1 rounded-xl text-black shadow-md"
        >
          Active
        </button>
        <button
          onClick={() => setselectedMenu("search")}
          className="text-xs bg-white px-4 py-1 rounded-xl text-black shadow-md"
        >
          Search
        </button>
      </div>

      {/* main content on the basis of selectedMenu */}
      {/* chats */}
      {selectedMenu == "chats" && (
        <>
          <p className="mb-4">Your Chats</p>
        </>
      )}
      {/* active users */}
      {selectedMenu == "active" && (
        <div className="active-container mb-4">
          <p className="mb-4">Active Users</p>
          <div className="active-users-container grid grid-cols-2 gap-5 ">
            {allConnectedUsers.map((connectedUser: any) => {
              // if (connectedUser.socketId != socket.id) {
              if (true) {
                return (
                  <div
                    key={connectedUser?._id}
                    className=" flex flex-col items-center"
                  >
                    <div className="active-user relative ">
                      <span className="absolute z-20 h-[10px] w-[10px] bg-green-500 bottom-0 left-0 rounded-full"></span>
                      <Avatar
                        sx={{ height: "5rem", width: "5rem" }}
                        className="bg-red-200 border-2 border-green-600 mb-2"
                        src="https://scontent.fktm19-1.fna.fbcdn.net/v/t39.30808-1/440571631_3660838454174508_7761877485988410125_n.jpg?stp=c34.95.185.185a_dst-jpg_p240x240_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_ohc=xAi1HTjeLp8Q7kNvgH9_il0&_nc_zt=24&_nc_ht=scontent.fktm19-1.fna&_nc_gid=AmcnuchHXyyopIJX_UWHexM&oh=00_AYCsx8YDzWp8IU0dA9_W9W_JjskQonI2DaS09MgtgT2RGg&oe=67805C02"
                      />
                    </div>
                    <p className="mb-2 text-sm">{connectedUser?.username}</p>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ background: "gray" }}
                      className="w-[80%] mx-auto"
                    >
                      <TextsmsIcon className="mr-2" sx={{ fontSize: "1rem" }} />
                      <span>Message</span>
                    </Button>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
      {/* search */}
      {selectedMenu == "search" && (
        <>
          <p>Search</p>
        </>
      )}
    </div>
  );
};

export default page;
