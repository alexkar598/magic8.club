import { RequestHandler } from "express-serve-static-core";
import { em } from "../../db.ts";
import { DbQuestion } from "../../entities/question.ts";
import {
  questionPostSchema,
  questionSchema,
} from "../../public_types/rest/question.ts";
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

  QuestionManager.subscribeAsAsker(socket, questionSchema.parse(dbQuestion));

  res.send(questionSchema.parse(dbQuestion));
  res.end();
}) satisfies RequestHandler;
