import { Server, Socket } from "socket.io";
import { GameSessionManager } from "../../config/data/GameSession"
import { generateRandomNumber } from '../../service/generateRandomNumber'
import { SessionData,Participants } from '../../config/data/GameSession'
export function sendMessageToRoom(io: Server, joinCode: string, message: string) {
  io.to(joinCode).emit("message", message);
}

// --- Helper to update all clients in a room ---
export function updateRoomState(io: Server, roomId: number) {
  const room = GameSessionManager.getSession(roomId)
  if (room) {
    io.to(roomId.toString()).emit("update-room-state", room);
  }
}

// --- Create Room Handler ---
export function handleCreateRoom(io: Server, socket: Socket, GameData: { quizId: string, hostId: string }) {
  const roomId = generateRandomNumber(6);

  const gamePreload: SessionData = { quizId: GameData.quizId, hostId: GameData.hostId, host_socket_id: socket.id,participants:[] }
  GameSessionManager.addSession(roomId, gamePreload)
  socket.join(roomId.toString());
  console.log(`User ${socket.id} (Host) created and joined room: ${roomId}`);

  socket.emit("room-created", roomId);
  updateRoomState(io, roomId);
}

// --- Join Room Handler ---
export function handleJoinRoom(io: Server, socket: Socket, data: { roomId: number; username: string, user_id: string, user_profile: string }) {
  const { roomId, username, user_id, user_profile } = data;
  const room = GameSessionManager.getSession(roomId);
  if (!room) {
    socket.emit("error-message", `Room "${roomId}" does not exist.`);
    return;
  }
  if (room.participants) {
    if (room.participants.length >= 20) {
      socket.emit("error-message", `Room "${roomId}" is already full.`);
      return;
    }
    const player:Participants = {
      isOnline:true,
      socket_id:socket.id,
      user_id:user_id,
      user_name:username,
      user_profile:user_profile,
    }
    room.participants.push(player);
    socket.join(roomId.toString());
    console.log(`User ${socket.id} (${username}) joined room: ${roomId}`);
    const data = { roomId:roomId, players: room.participants }
    socket.emit("join-successful",data);
    console.log(room)
    socket.broadcast.to(roomId.toString()).emit("update-room-state", room);

  }
}

// --- Host Message Handler ---
export function handleHostMessage(io: Server, data: { roomId: number; message: string }) {
  const { roomId, message } = data;
  if (GameSessionManager.isSessionActive(roomId)) {
    io.to(roomId.toString()).emit("new-message", message);
  }
}

// --- Disconnect Handler ---
export function handleDisconnectLobby(io: Server, socket: Socket) {
  console.log(`User disconnected: ${socket.id}`);
  let roomToUpdate: number | null = null;

  for (const [roomId, room] of GameSessionManager.waitLobby.entries()) {
    if (room.participants) {
      const idx: number = room.participants.findIndex(p => p.socket_id === socket.id);
      if (idx !== -1) {
        room.participants.splice(idx, 1);
      }
      console.log(`Player ${socket.id} removed from room ${roomId}`);
      roomToUpdate = roomId;

      if (room.participants.length === 0) {
        GameSessionManager.waitLobby.delete(roomId);
        console.log(`Room ${roomId} deleted (empty).`);
      }
      break;
    }
  }

  if (roomToUpdate && GameSessionManager.waitLobby.has(roomToUpdate)) {
    updateRoomState(io, roomToUpdate);
  }
}
