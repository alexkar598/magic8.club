import { RemoteSocket, Socket } from "socket.io";
import { DbUser } from "../entities/user.js";
import { Answer } from "./rest/answer.js";
import { Question } from "./rest/question.js";

export const room = {
  user: (user_id: string) => `user:${user_id}`,
  user_session: (user_id: string, sid: string) =>
    `${room.user(user_id)}:${sid}`,
  question: (question_id: string) => `question:${question_id}`,
  question_asker: (question_id: string) =>
    `${room.question(question_id)}:asker`,
  question_answerer: (question_id: string) =>
    `${room.question(question_id)}:answerer`,
  question_answerer_scoped: (question_id: string, user_id: string) =>
    `${room.question_answerer(question_id)}:${user_id}`,
};

export enum ConnectionFailureReason {
  SetupException,
  DuplicateSessionId,
  BadRequest,
}
export interface ServerToClientEvents {
  // Your question has been answered
  "question:answered": (question: Question, answer: Answer) => void;
  // Your question is being answered
  "question:pending": (question: Question) => void;
  // Your question is no longer being answered
  "question:cancelled": (question: Question) => void;
  // We have found a question for you to answer
  "answer:found_question": (question: Question) => void;
  // Your connection is ready
  "connection:ready": () => void;
  // Your connection has been terminated
  "connection:failed": (code: ConnectionFailureReason, reason?: string) => void;
}

export interface ClientToServerEvents {}

export interface InterServerEvents {}

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
