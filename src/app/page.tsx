"use client";
import { SocketContext } from "@/context/SocketContext";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { Button, TextField } from "@mui/material";

export default function home() {
  const [socketId, setsocketId] = useState("");
  const [to, setto] = useState<any>("");
  const [message, setmessage] = useState<any>({ data: "", to: "", from: "" });
  const [myMessages, setmyMessages] = useState<any>([]);
  const [allUsers, setallUsers] = useState<String[]>([]);
  const { socket, setSocket, isSocketConnected } =
    useContext<any>(SocketContext);

  useEffect(() => {
    if (!socket && !isSocketConnected) return;
    socket.on("connect", () => {
      setsocketId(socket.id);
      /// welcome
      socket.on("welcome", (data: String) => {
        console.log(data);
      });
      // new user
      socket.on("new-user", (allUsers: any) => {
        setallUsers(allUsers);
      });
      // new user
      socket.on("receive-message", (myMessage: any) => {
        setmyMessages((prev: any) => [...prev, myMessage]);
        // console.log(myMessage);
      });
      // new user
      socket.on("someone-disconnected", (allUsers: any) => {
        setallUsers(allUsers);
        // console.log("afet dis", allUsers);
      });
    });
  }, [socket, isSocketConnected]);

  function handleSendMessage(e: any) {
    e.preventDefault();
    if (socket && isSocketConnected) {
      const tempMessage = {
        data: message.data,
        to,
        from: socket.id,
      };
      socket.emit("send-to-message", tempMessage);
      setmyMessages((prev: any) => [...prev, tempMessage]);
      setmessage({ data: "", to: "", from: "" });
    }
  }
  return (
    <div>
      <div className="allusers">
        <p>All connected Users</p>
        {allUsers.map((user, i) => {
          if (user != socketId) {
            return (
              <div key={i} className="flex my-3">
                <p className="mr-5">{user}</p>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    setto(user);
                  }}
                >
                  Message
                </Button>
              </div>
            );
          }
        })}
      </div>
      <div className="mt-7">
        You are:{" "}
        <span className="bg-white text-black p-2 rounded-md"> {socketId}</span>
        <p>Send to</p>
        <input
          type="text"
          className="text-black"
          value={to}
          onChange={({ target }) => setto(target.value)}
        />
        <br />
        <p>Message</p>
        <form onSubmit={handleSendMessage}>
          <TextField
            variant="outlined"
            color="primary"
            size="small"
            value={message.data}
            autoComplete="off"
            onChange={({ target }) =>
              setmessage((prev: any) => {
                return { ...prev, data: target.value };
              })
            }
            className="bg-white text-black"
          />
          <Button variant="contained" type="submit">
            Send
          </Button>
        </form>
        <div className="w-[70%] ">
          {myMessages.map((message: any, i: any) => {
            if (message.from == socket.id) {
              return (
                <p
                  key={i}
                  className="bg-blue-500 text-white w-max p-2 rounded-md mx-7 my-3"
                >
                  {message.data}
                </p>
              );
            } else {
              return (
                <p
                  key={i}
                  className="bg-white text-black w-max p-2 ml-auto rounded-md mx-7 my-3"
                >
                  {message.data}
                </p>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
