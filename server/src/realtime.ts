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
  AppSocket,
  ClientToServerEvents,
  ConnectionFailureReason,
  InterServerEvents,
  room,
  ServerToClientEvents,
  SocketData,
} from "./public_types/socketio.js";

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
  cors: {
    origin: true,
    credentials: true,
    allowedHeaders: [magic8SessionIdHeaderName, "content-type"],
  },
});

io.use((_socket, next) => {
  RequestContext.create(em, next);
});

io.on("connection", async (socket) => {
  const sid = socket.request.headers[magic8SessionIdHeaderName.toLowerCase()];
  if (typeof sid != "string") {
    socket.emit(
      "connection:failed",
      ConnectionFailureReason.BadRequest,
      "Session ID missing",
    );
    return;
  }

  socket.data.sid = sid;

  const cookies = cookie.parse(socket.request.headers.cookie ?? "");
  const token = cookies[magic8TokenCookieName];

  try {
    const user = await resolveOrCreate(token);

    // Populate context
    socket.data.user_id = user.id;
    socket.data.user = user;

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

    // Join rooms
    socket.join([room.user(user.id), room.user_session(user.id, sid)]);

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
