import { RequestHandler } from "express-serve-static-core";
import { em } from "../../db.ts";
import { DbQuestion } from "../../entities/question.ts";
import {
  questionPostSchema,
  questionSchema,
} from "../../public_types/question.ts";
import QuestionManager from "../../QuestionManager.ts";
import { getSocket } from "../../realtime.ts";

export default (async (req, res) => {
  const question = questionPostSchema.parse(req.body);

  const socket = getSocket(req.user_id, req.sid);
  if (!socket) {
    res.status(422).end("Can't find a linked socket instance");
    return;
  }

  const dbQuestion = new DbQuestion(question.text, req.user);
  await em.persistAndFlush(dbQuestion);

  const questionResponse = questionSchema.parse(dbQuestion);

  QuestionManager.subscribeAsAsker(socket, questionResponse);

  res.send(questionResponse);
  res.end();
}) satisfies RequestHandler;
