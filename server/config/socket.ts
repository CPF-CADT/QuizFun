import {Server } from "socket.io";
import http from "http";
import { handleCreateRoom, handleDisconnectLobby, handleHostMessage, handleJoinRoom } from "../sockets/event/looby";

export default function socketSetup(server: http.Server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);
    socket.on("create-room", (data) => handleCreateRoom(io, socket, data ));
    socket.on("join-room", (data) => handleJoinRoom(io, socket, data));
    socket.on("host-message", (data) => handleHostMessage(io, data));
    socket.on("disconnect", () => handleDisconnectLobby(io, socket));
  });
}

