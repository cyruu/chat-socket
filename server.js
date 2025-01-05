import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

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
    socket.on("user-connected", (sessionData) => {
      const {
        user: { _id, username },
      } = sessionData;
      const tempConnectedUsers = { _id, username, socketId: socket.id };
      connectedUsers.push(tempConnectedUsers);
      io.emit("connected-users", connectedUsers);
    });

    // on disconnect
    socket.on("disconnect", () => {
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
