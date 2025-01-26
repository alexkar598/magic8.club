import { Answer } from "./rest/answer.js";
import { Question } from "./rest/question.js";

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
