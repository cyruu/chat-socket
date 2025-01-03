import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.IO server...");
    const io = new Server(res.socket.server, {
      path: "/api/socketio",
      cors: {
        origin: "*", // Adjust this based on your security needs
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      // Example event
      socket.on("message", (data) => {
        console.log("Message received:", data);
        io.emit("message", data); // Broadcast message
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
