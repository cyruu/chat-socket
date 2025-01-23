import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const dev = process.env.NODE_ENV !== "production";

// Use the PORT environment variable provided by Render (or default to 3000 for local development)
const port = process.env.PORT || 3000; // This will be set by Render in production
const hostname = dev ? "localhost" : "0.0.0.0";
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Replace '*' with specific origin(s) in production for security
      methods: ["GET", "POST"], // Allowed HTTP methods
      credentials: true, // Allow credentials (cookies, headers, etc.)
    },
  });

  let connectedUsers = [];
  io.on("connection", (socket) => {
    // initial socket connection event
    socket.on("user-connected", (sessionData) => {
      const {
        user: { _id, username, email },
      } = sessionData;
      // Remove old entry for the same user (_id)
      connectedUsers = connectedUsers.filter(
        (eachConnectedUser) => eachConnectedUser._id !== _id
      );
      const tempConnectedUsers = { _id, username, email, socketId: socket.id };
      connectedUsers.push(tempConnectedUsers);
      io.emit("connected-users", connectedUsers);
    });

    // send-message
    socket.on("send-message", (tempMessage) => {
      const {
        sentBy,
        sentByObject,
        receivedBy,
        receivedByObject,
        message,
        isDeleted,
        createdAt,
      } = tempMessage;

      // get socket id for sender and receiver from connectedUsers
      const senderSocketId = socket.id;
      // receiver is conncted to socket it gives socket it
      // if reciever is not active it gives null
      const receiverSocketId =
        connectedUsers.filter((connectedUser) => {
          return connectedUser._id == receivedBy;
        })[0]?.socketId || null;

      // receiver is active
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("receive-message-from-server", {
          ...tempMessage,
        });
      }

      //needed any how
      // send this same message to sender as well
      // to update message state in frontend
      socket.emit("receive-message-from-server", {
        ...tempMessage,
      });
    });
    // on deletemessage
    socket.on("message-deleted", (showMessage) => {
      const { receivedBy } = showMessage;
      const receiverSocketId =
        connectedUsers.filter((connectedUser) => {
          return connectedUser._id == receivedBy;
        })[0]?.socketId || null;
      socket
        .to(receiverSocketId)
        .emit("delete-message-from-server", showMessage);
    });
    // on disconnect
    socket.on("disconnect", () => {
      console.log("dissssssss", socket.id);
      connectedUsers = connectedUsers.filter(
        (eachConnectedUser) => eachConnectedUser.socketId != socket.id
      );

      io.emit("connected-users", connectedUsers);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
