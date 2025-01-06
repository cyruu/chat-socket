"use client";
import { setAllConnectedUsers } from "@/redux/chatSlice";
import { setSocket } from "@/redux/socketSlice";
import { Avatar, Button, TextField } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import TextsmsIcon from "@mui/icons-material/Textsms";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";

const page = () => {
  // state variables
  const [showMessages, setshowMessages] = useState<any>([]);
  const [selectedMenu, setselectedMenu] = useState("chats");
  const [message, setmessage] = useState<string | undefined>("");
  const [sentBy, setsentBy] = useState<string | undefined>("");
  // clientSocket for component
  const [componentClientSocket, setcomponentClientSocket] = useState<any>(null);

  // receivedBy cyruu
  const [receivedBy, setreceivedBy] = useState<string | undefined>(
    "677ab60db539cc776ec0150f"
  );
  //session data
  const { data: sessionData, status } = useSession();
  //redux hooks
  const dis = useDispatch();
  // redux socket only contain socketid , connected i.e. {id,connected}
  const socket = useSelector((state: any) => state.socketReducer.socket);
  const allConnectedUsers = useSelector(
    (state: any) => state.chatReducer.allConnectedUsers
  );
  //references
  const allMessagesContainerRef = useRef<any>(null);

  useEffect(() => {
    //set sentby to session user id
    if (sessionData?.user) {
      setsentBy(sessionData?.user?._id);
    }
    const clientSocket = io();
    // on socket connection
    clientSocket.on("connect", () => {
      // set to componentClientSocket
      setcomponentClientSocket(clientSocket);
      // send session data to server
      if (sessionData) {
        clientSocket.emit("user-connected", sessionData);
      }
      // set redux socket to connected socket
      dis(
        setSocket({ id: clientSocket.id, connected: clientSocket.connected })
      );

      // receive-message-from-server
      clientSocket.on("receive-message-from-server", (tempMessage) => {
        console.log(tempMessage);

        setshowMessages((prev: any) => [...prev, tempMessage]);
      });

      // initially get all connected users
      clientSocket.on("connected-users", (connectedUsers: String[]) => {
        dis(setAllConnectedUsers(connectedUsers));
      });
    });
    return () => {
      clientSocket?.disconnect();
    };
  }, [sessionData?.user]);

  // useEffect for scroll
  useEffect(() => {
    if (allMessagesContainerRef.current) {
      allMessagesContainerRef.current.scrollTo({
        top: allMessagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [showMessages.length]);

  // send message function
  function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (componentClientSocket) {
      const tempMessage = {
        sentBy,
        receivedBy,
        message,
        //default isDeleted false
        isDeleted: false,
      };

      componentClientSocket.emit("send-message", tempMessage);
    }
    console.log("sent by", sentBy);
    console.log("received by", receivedBy);
  }

  if (!socket || status == "loading") return <p>Loading..</p>;
  return (
    <div className="main-continer flex w-full h-full md:w-[70vw] md:h-[90vh]">
      {/* chat-container */}
      <div className="chat-bar hidden h-[100dvh] px-5  w-full md:w-1/2 md:h-full md:bg-white md:rounded-xl md:shadow-lg lf xl:w-[35%]">
        {/* chat-header */}
        <div className="chat-bar-header h-[10dvh] flex items-center justify-between">
          <p className="text-3xl font-bold ">Chat.io</p>
          <Button variant="grayvariant" onClick={() => signOut()}>
            <ExitToAppIcon />
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
            <p className="text-xs text-gray-500">{sessionData?.user?.email}</p>
          </div>
        </div>
        {/* menu-tabs */}
        <div className="menu-tabs flex justify-around bg-gray-300 items-center h-[6dvh] my-4 rounded-full">
          <button
            onClick={() => setselectedMenu("chats")}
            className={`text-xs px-4 py-1 rounded-xl text-black shadow-md ${
              selectedMenu == "chats" ? "bg-gray-400 text-white" : " bg-white"
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => setselectedMenu("active")}
            className={`text-xs px-4 py-1 rounded-xl text-black shadow-md ${
              selectedMenu == "active" ? "bg-gray-400 text-white" : " bg-white"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setselectedMenu("search")}
            className={`text-xs px-4 py-1 rounded-xl text-black shadow-md ${
              selectedMenu == "search" ? "bg-gray-400 text-white" : " bg-white"
            }`}
          >
            Search
          </button>
        </div>

        {/* main content on the basis of selectedMenu */}
        {/* chats */}
        {selectedMenu == "chats" && (
          <>
            <p className="mb-1">Your Chats</p>
            {/* all chat container */}
            <div className="all-chat-container flex flex-col">
              {/* eeach single chat */}
              <Button
                className="each-chat flex"
                variant="grayvariant"
                sx={{ padding: ".4rem 0", marginBottom: ".8rem" }}
              >
                <div className="avatar-container relative ">
                  <span className="absolute z-20 h-[8px] w-[8px] bg-green-500 bottom-0 left-0 rounded-full"></span>
                  <Avatar
                    sx={{ height: "3.5rem", width: "3.5rem" }}
                    className="bg-red-200 border-2 border-green-600"
                    src="https://scontent.fktm19-1.fna.fbcdn.net/v/t39.30808-1/440571631_3660838454174508_7761877485988410125_n.jpg?stp=c34.95.185.185a_dst-jpg_p240x240_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_ohc=xAi1HTjeLp8Q7kNvgH9_il0&_nc_zt=24&_nc_ht=scontent.fktm19-1.fna&_nc_gid=AmcnuchHXyyopIJX_UWHexM&oh=00_AYCsx8YDzWp8IU0dA9_W9W_JjskQonI2DaS09MgtgT2RGg&oe=67805C02"
                  />
                </div>
                {/* each-chat-info */}
                <div className="each-chat-info ml-3 w-full">
                  {/* username-time */}
                  <div className="username-time flex justify-between">
                    <p className="text-md text-black font-medium">
                      {sessionData?.user?.username}
                    </p>
                    <span className="text-xs text-gray-500">1 : 30</span>
                  </div>
                  {/* chat-msg-noti */}
                  <div className="chat-msg-noti flex justify-between">
                    <p className="text-xs text-gray-600 font-light ">
                      {"Hello, world! Lorem ipsum dolor sit amet consectetur".substring(
                        0,
                        30
                      )}
                      ...
                    </p>
                    <span className="z-20 h-[13px] w-[13px] bg-gray-400 rounded-full"></span>
                  </div>
                </div>
              </Button>
              {/* eeach single chat */}
              <div className="each-chat flex">
                <div className="avatar-container relative ">
                  <span className="absolute z-20 h-[8px] w-[8px] bg-green-500 bottom-0 left-0 rounded-full"></span>
                  <Avatar
                    sx={{ height: "3.5rem", width: "3.5rem" }}
                    className="bg-red-200 border-2 border-green-600"
                    src="https://scontent.fktm19-1.fna.fbcdn.net/v/t39.30808-1/440571631_3660838454174508_7761877485988410125_n.jpg?stp=c34.95.185.185a_dst-jpg_p240x240_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_ohc=xAi1HTjeLp8Q7kNvgH9_il0&_nc_zt=24&_nc_ht=scontent.fktm19-1.fna&_nc_gid=AmcnuchHXyyopIJX_UWHexM&oh=00_AYCsx8YDzWp8IU0dA9_W9W_JjskQonI2DaS09MgtgT2RGg&oe=67805C02"
                  />
                </div>
                {/* each-chat-info */}
                <div className="each-chat-info ml-3 w-full">
                  {/* username-time */}
                  <div className="username-time flex justify-between">
                    <p className="text-md font-medium">
                      {sessionData?.user?.username}
                    </p>
                    <span className="text-xs text-gray-500">1 : 30</span>
                  </div>
                  {/* chat-msg-noti */}
                  <div className="chat-msg-noti flex justify-between">
                    <p className="text-xs text-gray-600 font-light ">
                      {"Hello, world! Lorem ipsum dolor sit amet consectetur".substring(
                        0,
                        30
                      )}
                      ...
                    </p>
                    <span className="z-20 h-[13px] w-[13px] bg-gray-400 rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>
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
                        <TextsmsIcon
                          className="mr-2"
                          sx={{ fontSize: "1rem" }}
                        />
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
      {/* message-side-container */}
      <div className="message-side-container  flex-col h-full flex w-full md:w-1/2 ml-3 bg-white rounded-xl shadow-lg lf xl:w-[65%]">
        {/* message header */}
        <div className="message-header h-[9dvh] w-full px-5 flex justify-between items-center shadow-lg border-1">
          <div className="your-info flex">
            <div className="avatar-container relative ">
              <span className="absolute z-20 h-[6px] w-[6px] bg-green-500 bottom-0 left-0 rounded-full"></span>
              <Avatar
                sx={{ height: "2.5rem", width: "2.5rem" }}
                className="bg-red-200 border-2 border-green-600"
                src="https://scontent.fktm19-1.fna.fbcdn.net/v/t39.30808-1/440571631_3660838454174508_7761877485988410125_n.jpg?stp=c34.95.185.185a_dst-jpg_p240x240_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_ohc=xAi1HTjeLp8Q7kNvgH9_il0&_nc_zt=24&_nc_ht=scontent.fktm19-1.fna&_nc_gid=AmcnuchHXyyopIJX_UWHexM&oh=00_AYCsx8YDzWp8IU0dA9_W9W_JjskQonI2DaS09MgtgT2RGg&oe=67805C02"
              />
            </div>
            <div className="info ml-3">
              <p className="text-md font-medium">cyruu</p>
              <p className="text-[.6rem] text-gray-500">cyruu@gmail.com</p>
            </div>
          </div>
          {/* close button for mobile */}
          <Button variant="grayvariant">
            <ArrowBackIcon />
          </Button>
        </div>
        {/* messsage-container */}
        <div
          ref={allMessagesContainerRef}
          className="message-container scrollbar-hide flex flex-col justify-end p-5 pb-0 flex-1 overflow-y-auto "
        >
          {/* <div className="each-message bg-gray-200 text-sm  text-gray-500 w-max py-2 px-3 mb-2 rounded-full mr-auto">
            hello
          </div>
          <div className="each-message bg-blue-400 text-sm  text-white w-max py-2 px-3 mb-2 rounded-full ml-auto">
            Whats up
          </div> */}
          <div className="all-messages max-h-full w-full ">
            {showMessages.map((showMessage: any) => {
              return (
                <div
                  key={showMessage?.createdAt}
                  className={`each-message max-w-[50%] w-max py-2 px-3 mb-2 rounded-xl  break-words ${
                    showMessage.sentBy == sessionData?.user?._id
                      ? " ml-auto bg-blue-400 text-sm  text-white"
                      : " mr-auto bg-gray-200 text-sm  text-gray-500"
                  }`}
                >
                  {showMessage?.message}
                </div>
              );
            })}
          </div>
        </div>

        {/* input message */}
        <form
          onSubmit={sendMessage}
          className="input-message-container flex items-center bg-gray-100 rounded-full mx-5 mb-6 mt-4 px-4 py-3 "
        >
          <input
            placeholder="Type someting..."
            className="text-sm flex-1 bg-transparent mr-2 outline-none text-gray-500"
            value={message}
            onChange={({ target }) => setmessage(target.value)}
            required
          />
          <button className="" type="submit">
            <SendIcon sx={{ fontSize: "1.1rem", color: "gray" }} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default page;
