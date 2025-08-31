// server/sockets/socketSetup.ts
import { Server, Socket } from "socket.io";
import http from "http";
import redisClient from "./redis";
import { handleCreateRoom, handleJoinRoom, startGame, handleDisconnect } from "../sockets/event/handlers";
import { GameSessionManager } from "./data/GameSession";

export default function socketSetup(server: http.Server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", async (socket: Socket) => {
    console.log(`[Connection] User connected: ${socket.id}`);

    const { teamId, userId, roomId } = socket.handshake.query;

    // --- Join team room if teamId exists in query parameters ---
    if (teamId && typeof teamId === "string") {
      const teamRoom = `team-${teamId}`;
      socket.join(teamRoom);
      console.log(`[Team] Socket ${socket.id} auto-joined team room: ${teamRoom}`);

      // Fetch pending events for offline members
      socket.emit("fetch-pending-events", async (callback: (events: any[]) => void) => {
        try {
          const redisKey = `team:${teamId}:pendingEvents`;
          const events = (await redisClient.lRange(redisKey, 0, -1)) || [];
          const parsed = events.map(e => JSON.parse(e));
          callback(parsed);
          if (events.length) await redisClient.del(redisKey);
        } catch (err) {
          console.error("[Socket] Failed to fetch pending events:", err);
          callback([]);
        }
      });
    }

    // --- Handle manual team room joining (from frontend joinTeamRoom function) ---
    socket.on("join-team-room", (teamId: string) => {
      if (!teamId) return;
      const teamRoom = `team-${teamId}`;
      socket.join(teamRoom);
      console.log(`[Team] Socket ${socket.id} manually joined team room: ${teamRoom}`);

      // Send immediate confirmation to the client
      socket.emit("team-room-joined", { teamId, teamRoom });

      // Fetch pending events when manually joining
      socket.emit("fetch-pending-events", async (callback: (events: any[]) => void) => {
        try {
          const redisKey = `team:${teamId}:pendingEvents`;
          const events = (await redisClient.lRange(redisKey, 0, -1)) || [];
          const parsed = events.map(e => JSON.parse(e));
          console.log(`[Team] Sending ${parsed.length} pending events to ${socket.id}`);
          callback(parsed);
          if (events.length) await redisClient.del(redisKey);
        } catch (err) {
          console.error("[Socket] Failed to fetch pending events:", err);
          callback([]);
        }
      });
    });

    // Add a test event handler
    socket.on("test-connection", (data) => {
      console.log(`[Test] Received test-connection from ${socket.id}:`, data);
      socket.emit("test-response", { message: "Backend received your test", data });
    });

    // Store lobby events in Redis and notify online members
    socket.on("host-activated-lobby", async (data: { sessionId: string; roomId: number; teamId?: string }) => {
      const { sessionId, roomId, teamId } = data;
      if (!sessionId || !roomId) return;

      console.log(`[Team] Host activated lobby - SessionID: ${sessionId}, RoomID: ${roomId}, TeamID: ${teamId}`);

      if (teamId) {
        const teamRoom = `team-${teamId}`;
        const redisKey = `team:${teamId}:pendingEvents`;
        const eventData = { sessionId, joinCode: roomId, timestamp: Date.now() };

        // Check how many sockets are in the team room
        const socketsInRoom = await io.in(teamRoom).fetchSockets();
        console.log(`[Team] Sockets in room ${teamRoom}:`, socketsInRoom.map(s => s.id));

        try {
          await redisClient.rPush(redisKey, JSON.stringify(eventData));
          await redisClient.expire(redisKey, 3600); // TTL 1 hour

          // Emit to team room
          io.to(teamRoom).emit("team-lobby-activated", eventData);
          console.log(`[Team] Lobby activation event sent to ${teamRoom} (${socketsInRoom.length} sockets) and stored in Redis`);

          // Also send to individual socket for testing
          socketsInRoom.forEach(s => {
            console.log(`[Team] Sending team-lobby-activated directly to socket ${s.id}`);
            s.emit("team-lobby-activated", eventData);
          });

        } catch (err) {
          console.error("[Socket] Failed to store lobby event:", err);
        }
      }
    });

    // --- Lobby & Game Events ---
    socket.on("create-room", async (data) => {
      try { await handleCreateRoom(socket, io, data); } catch (err) { console.error(err); }
    });
    socket.on("join-room", async (data) => {
      try { await handleJoinRoom(socket, io, data); } catch (err) { console.error(err); }
    });
    socket.on("start-game", async (roomId) => {
      try { await startGame(socket, io, roomId); } catch (err) { console.error(err); }
    });

    // --- Disconnect ---
    socket.on("disconnect", async () => {
      try { await handleDisconnect(socket, io); } catch (err) { console.error(err); }
    });
  });
}