import { RequestContext } from "@mikro-orm/core";
import cookie from "cookie";
import { Server } from "socket.io";
import {
  magic8SessionIdHeaderName,
  magic8TokenCookieName,
  resolveOrCreate,
} from "./auth.ts";
import { em } from "./db.ts";
import {
  ClientToServerEvents,
  ConnectionFailureReason,
  InterServerEvents,
  ServerToClientEvents,
} from "./public_types/socketio.js";
import { AppSocket, room, SocketData } from "./types/socketio.js";
import process from "node:process";

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
  cors: {
    origin: true,
    credentials: !Boolean(process.env.SAME_ORIGIN),
    allowedHeaders: [magic8SessionIdHeaderName, "content-type"],
  },
  path: "/api/socket.io/",
  allowRequest: async (req, callback) => {
    try {
      const sid = req.headers[magic8SessionIdHeaderName.toLowerCase()];
      if (typeof sid != "string") {
        callback("Session ID missing", false);
        return;
      }

      req.sid = sid;

      const cookies = cookie.parse(req.headers.cookie ?? "");
      const token = cookies[magic8TokenCookieName];
      const user = await resolveOrCreate(token);

      // Populate context
      req.user_token = user.token;
      req.user_id = user.id;
      req.user = user;

      // Disconnect old sessions
      for (const socket of await io
        .in(room.user_session(user.id, sid))
        .fetchSockets()) {
        socket.emit(
          "connection:failed",
          ConnectionFailureReason.DuplicateSessionId,
        );
        socket.disconnect(true);
      }

      callback(null, true);
    } catch (e) {
      callback("Error in allowRequest: " + String(e), false);
    }
  },
});

io.use((_socket, next) => {
  RequestContext.create(em, next);
});

io.on("connection", async (socket) => {
  try {
    socket.data.sid = socket.request.sid;
    socket.data.user = socket.request.user;
    socket.data.user_id = socket.request.user_id;

    // Join rooms
    socket.join([
      room.user(socket.data.user_id),
      room.user_session(socket.data.user_id, socket.data.sid),
    ]);

    // Emit ready
    socket.emit("connection:ready");
  } catch (e) {
    console.error(e);
    socket.emit(
      "connection:failed",
      ConnectionFailureReason.SetupException,
      String(e),
    );
    socket.disconnect(true);
  }
});

export function getSocket(user_id: string, sid: string): AppSocket | undefined {
  for (const socket of io.sockets.sockets.values()) {
    if (socket.rooms.has(room.user_session(user_id, sid))) return socket;
  }
}
