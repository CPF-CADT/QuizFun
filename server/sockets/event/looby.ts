import { Server } from "socket.io";

export function sendMessageToRoom(io: Server, joinCode: string, message: string) {
  io.to(joinCode).emit("message", message);
}
