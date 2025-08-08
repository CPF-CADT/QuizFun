import { Server } from "socket.io";
import http from "http";

export default function socketSetup(server: http.Server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
}
