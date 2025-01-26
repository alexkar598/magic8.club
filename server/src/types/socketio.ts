import { RemoteSocket, Socket } from "socket.io";
import { DbUser } from "../entities/user.js";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "../public_types/socketio.js";

export const room = {
  user: (user_id: string) => `user:${user_id}`,
  user_session: (user_id: string, sid: string) =>
    `${room.user(user_id)}:${sid}`,
  question: (question_id: string) => `question:${question_id}`,
  question_asker: (question_id: string) =>
    `${room.question(question_id)}:asker`,
};

export interface SocketData {
  user_id: string;
  user: DbUser;
  sid: string;
}

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export type AppRemoteSocket = RemoteSocket<ServerToClientEvents, SocketData>;
