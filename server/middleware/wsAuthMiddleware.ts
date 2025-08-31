import { Server } from "socket.io";
import { verify } from "jsonwebtoken";

export function wsAuthMiddleware(io: Server) {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(" ")[1];
            if (!token) throw new Error("Unauthorized");

            const payload = verify(token, process.env.JWT_SECRET!) as { sub: string; name: string };
            socket.data.userId = payload.sub;
            socket.data.name = payload.name;
            next();
        } catch {
            next(new Error("Unauthorized"));
        }
    });
}
