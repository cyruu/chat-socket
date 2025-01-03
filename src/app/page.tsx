"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketClient = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const socketInstance = io({
      path: "/api/socketio",
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to server:", socketInstance.id);
    });

    socketInstance.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit("message", input);
      setInput("");
    }
  };

  return (
    <div>
      <h1>Socket.IO Chat</h1>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default SocketClient;
