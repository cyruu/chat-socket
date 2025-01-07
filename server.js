import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

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
      console.log(tempMessage);

      const {
        sentBy,
        sentByObject,
        receivedBy,
        receivedByObject,
        message,
        isDeleted,
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
          createdAt: Date.now(),
        });
      }

      //needed any how
      // send this same message to sender as well
      // to update message state in frontend
      socket.emit("receive-message-from-server", {
        ...tempMessage,
        createdAt: Date.now(),
      });
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
