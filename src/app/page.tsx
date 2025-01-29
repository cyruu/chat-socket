"use client";
import { setAllConnectedUsers } from "@/redux/chatSlice";
import { setSocket } from "@/redux/socketSlice";
import { Avatar, Button, Modal, TextField } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import TextsmsIcon from "@mui/icons-material/Textsms";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import CommentsDisabledIcon from "@mui/icons-material/CommentsDisabled";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { notify } from "@/utils/notify";
import { useRouter } from "next/navigation";

const page = () => {
  const uniqueDates: any = [];
  // state variables

  const [searchInput, setsearchInput] = useState<any>("");

  const [mySocket, setmySocket] = useState<any>(null);
  const [defaultSearchUsers, setdefaultSearchUsers] = useState<any>([]);
  const [searchUsers, setsearchUsers] = useState<any>([]);
  const [showMessages, setshowMessages] = useState<any>([]);
  const [selectedMenu, setselectedMenu] = useState("chats");
  const [message, setmessage] = useState<string | undefined>("");
  const [sentBy, setsentBy] = useState<string | undefined>("");
  const [receivedBy, setreceivedBy] = useState<any>("");
  const [receivedByObject, setreceivedByObject] = useState<any>(null);
  const [yourChats, setyourChats] = useState<any>([]);
  const [messagePopUp, setmessagePopUp] = useState<any>(false);
  const [selectedMessageDate, setselectedMessageDate] = useState<any>("");

  //router
  const router = useRouter();

  // clientSocket for component
  const [componentClientSocket, setcomponentClientSocket] = useState<any>(null);

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
  const mainContainerRef = useRef<any>(null);
  const messageRef = useRef<any>(null);

  //modal states
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const scrollToRight = () => {
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({
        left: mainContainerRef.current.scrollWidth,
      });
    }
  };

  const scrollToLeft = () => {
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({
        left: 0,
      });
    }
  };

  function closeMessagePopUp() {
    setmessagePopUp(false);
    setselectedMessageDate("");
  }
  useEffect(() => {
    document.addEventListener("click", closeMessagePopUp);
    return () => {
      document.removeEventListener("click", closeMessagePopUp);
    };
  }, []);
  // handle delete message
  async function handleDeleteMessage(showMessage: any) {
    const { data: resData } = await axios.post(
      "api/messages/deletemessage",
      showMessage
    );
    if (resData.statusCode != 200) {
      notify(resData.msg, resData.statusCode);
      return;
    }
    // change messagedeleted state variable

    mySocket.emit("message-deleted", showMessage);
    // update your chats to show msg delted
    setyourChats((prev: any) => {
      let tempyourchats = [...prev];
      console.log(tempyourchats);
      tempyourchats = tempyourchats.map((chat: any) => {
        if (chat.createdAt == showMessage.createdAt) {
          return {
            ...chat,
            isDeleted: true,
          };
        } else {
          return chat;
        }
      });
      console.log(tempyourchats);

      return tempyourchats;
    });
    //update state
    setshowMessages((prev: any) => {
      const tempshowMessages = [...prev];
      const newshowMessages = tempshowMessages.map((message: any) => {
        if (message.createdAt != showMessage.createdAt) {
          return message;
        } else {
          return {
            ...message,
            isDeleted: true,
          };
        }
      });
      // update localstorage
      let allConversations = JSON.parse(
        localStorage.getItem("allConversations") || "{}"
      );
      allConversations = {
        ...allConversations,
        [receivedBy]: newshowMessages,
      };
      localStorage.setItem(
        "allConversations",
        JSON.stringify(allConversations)
      );
      return newshowMessages;
    });
  }

  // serach input debounce
  useEffect(() => {
    if (searchInput.trim() === "") {
      // dfault search usrs
      setsearchUsers(defaultSearchUsers);
      return;
    }
    const timeout = setTimeout(() => {
      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
      let searchUsers = allUsers.filter((user: any) =>
        user.username.toLowerCase().includes(searchInput.toLowerCase())
      );
      setsearchUsers(searchUsers);
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput, defaultSearchUsers]);

  // socket use effect
  useEffect(() => {
    //set sentby to session user id
    if (sessionData?.user) {
      setsentBy(sessionData?.user?._id);
    }
    // const clientSocket = io("https://chat-socket-h3wn.onrender.com");
    const clientSocket = io("");
    // on socket connection
    clientSocket.on("connect", () => {
      // set to componentClientSocket
      setcomponentClientSocket(clientSocket);
      // send session data to server
      if (sessionData) {
        clientSocket.emit("user-connected", sessionData);
      }
      // set state socket
      setmySocket(clientSocket);
      // set redux socket to connected socket
      dis(
        setSocket({ id: clientSocket.id, connected: clientSocket.connected })
      );

      // receive-message-from-server
      clientSocket.on("receive-message-from-server", (tempMessage) => {
        const {
          sentBy: sentByServer,
          receivedBy: receivedByServer,
          sentByObject,
          receivedByObject,
          message,
          createdAt,
          isDeleted,
        } = tempMessage;

        let otherUserId =
          sentByServer == sentBy ? receivedByServer : sentByServer;
        let allConversations = JSON.parse(
          localStorage.getItem("allConversations") || "{}"
        );

        // if convo already there then append
        if (allConversations[otherUserId]) {
          let newAllConversations = {
            ...allConversations,
            [otherUserId]: [...allConversations[otherUserId], tempMessage],
          };
          localStorage.setItem(
            "allConversations",
            JSON.stringify(newAllConversations)
          );
        }
        // create new convo id with that user
        else {
          let newAllConversations = {
            ...allConversations,
            [otherUserId]: [tempMessage],
          };
          localStorage.setItem(
            "allConversations",
            JSON.stringify(newAllConversations)
          );
        }

        // chat sent by me and received by receivedBy
        // chat sent by receivedBt and received by me
        if (
          (sentByServer == sentBy && receivedByServer == receivedBy) ||
          (sentByServer == receivedBy && receivedByServer == sentBy)
        ) {
          setshowMessages((prev: any) => {
            return [...prev, tempMessage];
          });
        }

        // if (sentByServer == sentBy && receivedByServer == receivedBy) {
        //   setshowMessages((prev: any) => [...prev, tempMessage]);
        // }

        const otherUserObject =
          sentByServer === sessionData?.user?._id
            ? receivedByObject
            : sentByObject; // Identify the other user's ID.

        setyourChats((prevChats: any) => {
          // Find the index of the chat with the other user.
          const existingChatIndex = prevChats.findIndex(
            (chat: any) => chat.otherUserObject._id === otherUserObject._id
          );
          let updatedChats;

          if (existingChatIndex !== -1) {
            // Chat exists, update it with the latest message and createdAt.
            updatedChats = [...prevChats];
            updatedChats[existingChatIndex] = {
              ...updatedChats[existingChatIndex],
              latestMessage: message,
              createdAt,
              isDeleted,
            };
          } else {
            // Chat does not exist, add a new one.
            updatedChats = [
              ...prevChats,
              {
                otherUserObject,
                latestMessage: message,
                createdAt,
                isDeleted,
              },
            ];
          }

          // Sort the chats by createdAt (latest first).
          return updatedChats.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      });
      // delete-message-from-server
      clientSocket.on("delete-message-from-server", (showMessage) => {
        setyourChats((prevYourChats: any) => {
          let tempyourchats = [...prevYourChats];
          tempyourchats = tempyourchats.map((yourChat: any) => {
            if (
              yourChat.createdAt == showMessage.createdAt &&
              yourChat.latestMessage == showMessage.message
            ) {
              return { ...yourChat, isDeleted: true };
            } else {
              return yourChat;
            }
          });
          return tempyourchats;
        });
      });
      // initially get all connected users
      clientSocket.on("connected-users", (connectedUsers: String[]) => {
        dis(setAllConnectedUsers(connectedUsers));
      });
      // on message-deleted
      clientSocket.on("message-deleted", (showMessage: any) => {
        console.log("msg delted notifiaiton");
      });
    });
    return () => {
      clientSocket?.disconnect();
    };
  }, [sessionData?.user, sentBy, receivedBy]);

  // useEffect for scroll
  useEffect(() => {
    if (allMessagesContainerRef.current) {
      allMessagesContainerRef.current.scrollTo({
        top: allMessagesContainerRef.current.scrollHeight,
        // behavior: "smooth",
      });
    }
  }, [showMessages.length]);

  // send message function
  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (componentClientSocket) {
      const tempMessage = {
        sentBy,
        sentByObject: {
          _id: sessionData?.user?._id,
          username: sessionData?.user?.username,
          email: sessionData?.user?.email,
          imageUrl: sessionData?.user?.imageUrl,
        },
        receivedBy,
        receivedByObject,
        message,
        //default isDeleted false
        isDeleted: false,
        createdAt: Date.now(),
      };
      console.log("sendingggggggggg", tempMessage);

      componentClientSocket.emit("send-message", tempMessage);
      // data to database
      const { data: resData } = await axios.post(
        "api/messages/sendmessage",
        tempMessage
      );

      setmessage("");
      if (resData.statusCode == 200) {
        console.log("message sent");
      } else {
        console.log("message not sent");
      }
    }
    console.log("sent by", sentBy);
    console.log("received by", receivedBy);
  }

  // change showmessges if receivedby change
  useEffect(() => {
    if (receivedBy) {
      let allConversations = JSON.parse(
        localStorage.getItem("allConversations") || "{}"
      );
      if (allConversations[receivedBy]) {
        setshowMessages(allConversations[receivedBy]);
      } else {
        setshowMessages([]);
      }
    }
  }, [receivedBy]);

  async function getUserMessages() {
    const { data: resData } = await axios.post("api/messages/getusermessages", {
      sentBy,
    });
    const allMessages = resData.allMessages;
    // for localstorate
    let allConversations: any = {};
    let yourChats: any = [];

    // Iterate over all messages
    allMessages.forEach((message: any) => {
      let otherUserId =
        message.sentBy === sentBy ? message.receivedBy : message.sentBy;
      // for yourchats otherUserObject
      const otherUserObject =
        message.sentBy === sentBy
          ? message.receivedByObject
          : message.sentByObject;

      // allconversatons operation start
      if (!allConversations[otherUserId]) {
        allConversations[otherUserId] = [];
      }

      allConversations[otherUserId].push(message);
      // allconversatons operation end

      // yourchats operation start
      // Check if a chat with this user already exists in yourChats
      const existingChatIndex = yourChats.findIndex(
        (chat: any) => chat.otherUserObject._id === otherUserObject._id
      );
      if (existingChatIndex !== -1) {
        // Update the latest message and createdAt for the existing chat
        yourChats[existingChatIndex] = {
          otherUserObject,
          latestMessage: message.message,
          createdAt: message.createdAt,
          isDeleted: message.isDeleted,
        };
      } else {
        // Add a new chat entry for this user
        yourChats.push({
          otherUserObject,
          latestMessage: message.message,
          createdAt: message.createdAt,
          isDeleted: message.isDeleted,
        });
      }
    });
    yourChats.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    // yourchat end

    //outside foreach
    localStorage.setItem("allConversations", JSON.stringify(allConversations));
    // for yourchat
    setyourChats(yourChats);
  }
  // inital load of messages
  useEffect(() => {
    if (sentBy) {
      getUserMessages();
    }
  }, [sentBy]);

  // get all users
  async function getAllUsers() {
    const { data: resData } = await axios.get("api/users/getallusers");

    if (resData.statusCode == 200) {
      localStorage.setItem("allUsers", JSON.stringify(resData.allUsers));
      setdefaultSearchUsers(resData.allUsers.slice(0, 5));
    }
  }

  // inital fetch all users to show in search
  useEffect(() => {
    getAllUsers();
  }, []);

  if (!socket || status == "loading") return <p>Loading..</p>;
  return (
    <div
      ref={mainContainerRef}
      className="main-container overflow-x-auto w-[100dvw] h-[100dvh] overflow-y-hidden snap-x  snap-mandatory flex scroll-smooth md:items-center md:justify-center md:w-[70vw] md:h-[90vh]"
    >
      {/*mainnn chat-container */}
      <div className="chat-bar bg-white overflow-y-auto scrollbar-hide  flex-shrink-0 w-[100dvw] h-screen px-5 snap-center md:flex-shrink  md:w-1/2 md:h-full md:rounded-xl md:shadow-lg xl:w-[35%]">
        {/* chat-header */}
        <div className="chat-bar-header h-[8dvh] flex items-center justify-between">
          <p className="text-3xl font-bold ">Chat.io</p>
          <Button variant="grayvariant" onClick={handleOpen}>
            <ExitToAppIcon />
          </Button>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            className="flex items-center justify-center"
          >
            <div className="bg-white p-10 px-14 rounded-xl text-center shadow-lg">
              <p className="mb-4">Confirm Logout?</p>
              <Button
                sx={{
                  background: "gray",
                  color: "white",
                  marginRight: ".6rem",
                }}
                onClick={async () => {
                  localStorage.removeItem("allConversations");
                  const { data: resData } = await axios.get("api/users/logout");

                  notify(resData.msg, resData.statusCode);
                  router.push("/login");
                }}
              >
                Logout
              </Button>
              <Button
                variant="outlined"
                sx={{ color: "gray", marginLeft: ".6rem" }}
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </Modal>
        </div>
        {/* your info */}
        <div className="your-info flex">
          <div className="avatar-container relative ">
            <span className="absolute z-20 h-[8px] w-[8px] bg-green-500 bottom-0 left-0 rounded-full"></span>
            <Avatar
              sx={{ height: "3.5rem", width: "3.5rem" }}
              className="border-2 border-green-600"
              src={
                sessionData?.user.imageUrl == "none"
                  ? ""
                  : sessionData?.user.imageUrl
              }
            />
          </div>
          <div className="info ml-3">
            <p className="text-lg">{sessionData?.user?.username}</p>
            <p className="text-xs text-gray-500">{sessionData?.user?.email}</p>
          </div>
        </div>
        {/* menu-tabs */}
        <div className="menu-tabs flex justify-around bg-gray-300 items-center h-[6dvh] my-3 rounded-full">
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
        {/* text */}
        <p className="mb-1 text-sm text-gray-500 font-bold">
          {selectedMenu == "chats"
            ? "Your chats"
            : selectedMenu == "active"
            ? "Active users"
            : selectedMenu == "search"
            ? "Search people"
            : "Search people"}
        </p>
        {/* main content on the basis of selectedMenu */}
        {/* chats */}
        {selectedMenu == "chats" && (
          <>
            {/* all chat container */}
            <div className="all-chat-container flex flex-col">
              {yourChats.length == 0 ? (
                <div className="w-max mx-auto text-center mt-6">
                  <CommentsDisabledIcon sx={{ color: "gray" }} />
                  <p className="text-xs text-gray-500 mt-2">
                    No chats yet. Start one now!
                  </p>
                  <button
                    onClick={() => setselectedMenu("search")}
                    className={`mt-3 bg-gray-400 text-sm px-4 py-2 rounded-full text-white  shadow-md`}
                  >
                    Find people
                  </button>
                </div>
              ) : (
                <div className="all-chats  ">
                  {yourChats.map((chat: any) => {
                    console.log(chat);

                    const {
                      otherUserObject,
                      latestMessage,
                      createdAt,
                      isDeleted,
                    } = chat;
                    // console.log(chat);
                    let userActive = allConnectedUsers.some(
                      (connectedUser: any) =>
                        connectedUser._id === otherUserObject._id
                    );
                    console.log(chat);

                    // each chat
                    return (
                      <Button
                        onClick={() => {
                          setreceivedBy(otherUserObject?._id);
                          setreceivedByObject(otherUserObject);
                          scrollToRight();
                        }}
                        key={createdAt}
                        className="each-chat w-full bg-red-300+ flex"
                        variant="grayvariant"
                        sx={{ padding: ".4rem 0", marginBottom: ".4rem" }}
                      >
                        <div className="avatar-container relative ">
                          {userActive && (
                            <span
                              className={`absolute z-20 h-[8px] w-[8px] bg-green-500 bottom-0 left-0 rounded-full`}
                            ></span>
                          )}

                          <Avatar
                            sx={{ height: "3.5rem", width: "3.5rem" }}
                            className={`bg-red-200 border-2 ${
                              userActive
                                ? " border-green-600"
                                : " border-gray-500"
                            }`}
                            src={
                              otherUserObject?.imageUrl == "none"
                                ? ""
                                : otherUserObject?.imageUrl
                            }
                          />
                        </div>
                        {/* each-chat-info */}
                        <div className="each-chat-info ml-3 w-full">
                          {/* username-time */}
                          <div className="username-time flex justify-between">
                            <p className="text-md text-black font-medium">
                              {otherUserObject?.username}
                            </p>
                            <span className="text-xs text-gray-500">
                              {(() => {
                                let date = new Date(createdAt);
                                let month = date.toLocaleString("en-US", {
                                  month: "short",
                                });
                                let hours = date.getHours();
                                let minutes = date
                                  .getMinutes()
                                  .toString()
                                  .padStart(2, "0");
                                let period = hours >= 12 ? "PM" : "AM";

                                hours = hours % 12 || 12;

                                return `${month}, ${hours}:${minutes} ${period}`;
                              })()}
                            </span>
                          </div>
                          {/* chat-msg-noti */}
                          <div className="chat-msg-noti flex justify-between">
                            {isDeleted ? (
                              <p className="text-xs text-gray-600 font-light ">
                                Message Deleted
                              </p>
                            ) : (
                              <p className="text-xs text-gray-600 font-light ">
                                {latestMessage.length > 30
                                  ? `${latestMessage.substring(0, 30)} ...`
                                  : latestMessage}
                              </p>
                            )}

                            {/* <span className="active-circle z-20 h-[10px] w-[10px] bg-gray-400 rounded-full"></span> */}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
        {/* active users */}
        {selectedMenu == "active" && (
          <div className="active-container mb-4">
            {allConnectedUsers.length <= 1 ? (
              <div className="w-max mx-auto text-center mt-7">
                <PersonOffIcon sx={{ color: "gray" }} />
                <p className="text-xs text-gray-500">No active users</p>
              </div>
            ) : (
              <div className="active-users-container grid grid-cols-2 gap-5 ">
                {allConnectedUsers.map((connectedUser: any) => {
                  if (connectedUser.socketId != socket.id) {
                    // if (true) {
                    // console.log(connectedUser);

                    return (
                      <div
                        key={connectedUser?._id}
                        className=" flex flex-col items-center"
                      >
                        <div className="active-user relative ">
                          <span className="absolute z-20 h-[10px] w-[10px] bg-green-500 bottom-0 left-0 rounded-full"></span>
                          <Avatar
                            sx={{ height: "5rem", width: "5rem" }}
                            className=" border-2 border-green-600 mb-2"
                            src={
                              connectedUser?.imageUrl == "none"
                                ? ""
                                : connectedUser?.imageUrl
                            }
                          />
                        </div>
                        <p className="mb-2 text-sm">
                          {connectedUser?.username}
                        </p>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ background: "gray" }}
                          className="w-[80%] mx-auto"
                          onClick={() => {
                            setreceivedBy(connectedUser?._id);
                            setreceivedByObject(connectedUser);
                          }}
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
            )}
          </div>
        )}
        {/* search */}
        {selectedMenu == "search" && (
          <div>
            <div className="searchbar bg-">
              <input
                type="text"
                value={searchInput}
                onChange={({ target }) => setsearchInput(target.value)}
                placeholder="search..."
                className="w-full px-5  py-3 text-xs bg-gray-200 text-gray-500 outline-none rounded-full md:text-sm"
              />
            </div>
            {searchInput.trim() == "" ? (
              <p className="text-gray-600 text-xs mt-3 mb-1 font-medium">
                You may know
              </p>
            ) : (
              <p className="text-gray-600 text-xs mt-3 mb-1 font-medium">
                Searching : <span className="font-bold">{searchInput}</span>
              </p>
            )}
            <div className="search-results">
              {/* searchuser not found */}
              {searchUsers.length == 0 ? (
                <div className="w-max mx-auto text-center mt-7">
                  <PersonOffIcon sx={{ color: "gray" }} />
                  <p className="text-xs text-gray-500">User not found</p>
                </div>
              ) : (
                <div className="search-users">
                  {searchUsers.map((user: any) => {
                    let userActive = allConnectedUsers.some(
                      (connectedUser: any) => connectedUser._id === user._id
                    );

                    return (
                      <Button
                        onClick={() => {
                          console.log("clicket");

                          setreceivedBy(user?._id);
                          setreceivedByObject({
                            username: user.username,
                            email: user.email,
                            _id: user._id,
                            imageUrl: user.imageUrl,
                          });
                          scrollToRight();
                        }}
                        key={user._id}
                        className="each-chat w-full bg-red-300+ flex"
                        variant="grayvariant"
                        sx={{ padding: ".4rem 0", marginBottom: "0rem" }}
                      >
                        <div className="avatar-container relative ">
                          {userActive && (
                            <span
                              className={`absolute z-20 h-[8px] w-[8px] bg-green-500 bottom-0 left-0 rounded-full`}
                            ></span>
                          )}

                          <Avatar
                            sx={{ height: "3rem", width: "3rem" }}
                            className={`border-2 ${
                              userActive
                                ? " border-green-600"
                                : " border-gray-500"
                            }`}
                            src={user?.imageUrl == "none" ? "" : user?.imageUrl}
                          />
                        </div>
                        {/* each-chat-info */}
                        <div className="each-chat-info ml-3 w-full">
                          {/* username-time */}
                          <div className="username-time flex justify-between">
                            <p className="text-md text-black font-medium">
                              {user?.username}
                            </p>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
              {searchInput.trim() == "" && (
                <p className="text-xs mx-auto mt-4 w-max text-gray-500">
                  Search for someone cool.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {/*mainnn message-side-container */}
      <div className="message-side-container bg-white flex-shrink-0 w-[100dvw] flex-col h-full flex snap-center md:flex-shrink md:rounded-xl md:w-1/2 md:ml-3 xl:w-[65%]">
        {receivedBy && receivedByObject ? (
          <>
            {/* message header */}
            <div className="message-header h-[9dvh] w-full px-5 flex justify-between items-center shadow-lg border-1">
              <div className="your-info flex">
                <div className="avatar-container relative ">
                  <span className="absolute z-20 h-[6px] w-[6px] bg-green-500 bottom-0 left-0 rounded-full"></span>
                  <Avatar
                    sx={{ height: "2.5rem", width: "2.5rem" }}
                    className="bg-red-200 border-2 border-green-600"
                    src=""
                  />
                </div>
                <div className="info ml-3">
                  <p className="text-md font-medium">
                    {receivedByObject.username}
                  </p>
                  <p className="text-[.6rem] text-gray-500">
                    {receivedByObject.email}
                  </p>
                </div>
              </div>
              {/* close button for mobile */}
              <Button
                variant="grayvariant"
                onClick={() => {
                  scrollToLeft();
                }}
              >
                <ArrowBackIcon />
              </Button>
            </div>
            {/* messsage-container */}
            <div
              className="message-container scrollbar-hide flex flex-col justify-end p-5 pb-0 flex-1 overflow-y-auto "
              ref={allMessagesContainerRef}
            >
              {showMessages.length == 0 ? (
                <div className="flex items-center justify-center flex-col mb-5">
                  <WavingHandIcon sx={{ fontSize: "2.1rem", color: "gray" }} />
                  <p className="text-gray-500 font-medium mt-1">
                    Start a conversation
                  </p>
                </div>
              ) : (
                <div className="all-messages max-h-full w-full ">
                  {showMessages.map((showMessage: any) => {
                    // console.log(showMessage);
                    let isDifferentDate = false;
                    const { createdAt } = showMessage;
                    const currentDate = new Date(createdAt);
                    let year = currentDate.toLocaleString("en-US", {
                      year: "numeric",
                    });
                    let month = currentDate.toLocaleString("en-US", {
                      month: "short",
                    });
                    let day = currentDate.toLocaleString("en-US", {
                      day: "numeric",
                    });
                    let hours = currentDate.getHours();
                    let minutes = currentDate
                      .getMinutes()
                      .toString()
                      .padStart(2, "0");
                    let period = hours >= 12 ? "PM" : "AM";

                    hours = hours % 12 || 12;

                    const tempDate = `${year}, ${month} ${day}`;
                    if (!uniqueDates.includes(tempDate)) {
                      isDifferentDate = true;
                      uniqueDates.push(tempDate);
                    }
                    return (
                      <div key={showMessage?.createdAt + "-" + uuidv4()}>
                        {/* new date */}
                        {isDifferentDate && (
                          <div className="w-max text-xs text-gray-500 mx-auto my-4">
                            {tempDate}
                          </div>
                        )}
                        <div
                          ref={messageRef}
                          className={`  flex ${
                            showMessage.sentBy == sessionData?.user?._id
                              ? " justify-end"
                              : " justify-start"
                          }`}
                        >
                          <div className=" flex items-start relative max-w-[45%] group">
                            {showMessage.sentBy == sessionData?.user?._id && (
                              <button
                                onFocus={() => {
                                  setmessagePopUp(true);
                                  setselectedMessageDate(showMessage.createdAt);
                                }}
                                className={`cursor-pointer ${
                                  messagePopUp ? " opacity-100 " : " opacity-0 "
                                } opacity-0 group-hover:opacity-100`}
                              >
                                <MoreVertIcon
                                  sx={{ color: "gray", fontSize: "1.2rem" }}
                                />
                              </button>
                            )}
                            {/* pop up */}
                            {messagePopUp &&
                              new Date(selectedMessageDate).getTime() ==
                                new Date(showMessage.createdAt).getTime() && (
                                <div className="absolute flex flex-col items-start -left-[75px] -top-1 bg-gray-100 border shadow-md rounded-md overflow-hidden z-10 ">
                                  <button
                                    className="text-xs text-gray-600 px-4 py-1 w-full hover:bg-gray-300"
                                    onClick={() =>
                                      handleDeleteMessage(showMessage)
                                    }
                                  >
                                    Delete
                                  </button>
                                  <button
                                    className="text-xs text-gray-600 px-4 py-1 hover:bg-gray-300"
                                    onClick={closeMessagePopUp}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            {/* main message */}
                            <div
                              className={`each-message py-2 px-3 mb-2 rounded-xl max-w-full w-max break-words ${
                                showMessage.sentBy == sessionData?.user?._id
                                  ? " bg-blue-400 text-sm text-white "
                                  : " bg-gray-200 text-sm text-gray-500 "
                              }
                            
                              
                            `}
                            >
                              {showMessage.isDeleted ? (
                                <span>Message Deleted</span>
                              ) : (
                                <div className="flex flex-col">
                                  <span>{showMessage?.message}</span>
                                  <span className="text-xs w-max ml-auto">{`${hours}:${minutes} ${period}`}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center ">
            <p className="font-bold text-gray-500 text-lg">Select a convo</p>
            <button
              onClick={() => {
                setselectedMenu("chats");
                scrollToLeft();
              }}
              className={`mt-2 bg-gray-400 text-sm px-4 py-2 rounded-full text-white  shadow-md`}
            >
              Les goo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
