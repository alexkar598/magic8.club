import { RequestContext } from "@mikro-orm/core";
import { RemoteSocket, Server, Socket } from "socket.io";
import {
  magic8SessionIdHeaderName,
  magic8TokenCookieName,
  resolveOrCreate,
} from "./auth.ts";
import { em } from "./db.ts";
import { DbUser } from "./entities/user.ts";
import { QuestionPost } from "./public_types/question.ts";
import cookie from "cookie";

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>();

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

enum ConnectionFailureReason {
  SetupException,
  DuplicateSessionId,
  BadRequest,
}
interface ServerToClientEvents {
  // Your question has been answered
  "question:answered": (question: QuestionPost) => void;
  // Your question is being answered
  "question:pending": (question: QuestionPost) => void;
  // We have found a question for you to answer
  "answer:found_question": (question: QuestionPost) => void;
  // Your connection is ready
  "connection:ready": () => void;
  // Your connection has been terminated
  "connection:failed": (code: ConnectionFailureReason, reason?: string) => void;
}

interface ClientToServerEvents {}

interface InterServerEvents {}

interface SocketData {
  user_id: string;
  user: DbUser;
  sid: string;
}

export const room = {
  user: (user_id: string) => `user:${user_id}`,
  user_session: (user_id: string, sid: string) => `user:${user_id}:${sid}`,
};

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export type AppRemoteSocket = RemoteSocket<ServerToClientEvents, SocketData>;

export function getSocket(user_id: string, sid: string): AppSocket | undefined {
  for (const socket of io.sockets.sockets.values()) {
    if (socket.rooms.has(room.user_session(user_id, sid))) return socket;
  }
}
