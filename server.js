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
  let allUsers = [];
  io.on("connection", (socket) => {
    allUsers.push(socket.id);
    io.emit("welcome", `${socket.id} joined the socket.`);
    io.emit("new-user", allUsers);
    // disconnect
    socket.on("disconnect", () => {
      allUsers = allUsers.filter((el) => el != socket.id);
      io.emit("someone-disconnected", allUsers);
    });
    // send-to-message
    socket.on("send-to-message", ({ data, to: sentTo, from }) => {
      console.log("messge at server", data);

      socket.to(sentTo).emit("receive-message", { data, sentTo, from });
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
