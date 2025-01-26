import { RequestHandler } from "express-serve-static-core";
import { em } from "../../db.js";
import { DbAnswer } from "../../entities/answer.js";
import { DbQuestion } from "../../entities/question.js";
import { answerPostSchema } from "../../public_types/rest/answer.js";
import QuestionManager from "../../QuestionManager.js";
import { getSocket } from "../../realtime.ts";

export default (async (req, res) => {
  const socket = getSocket(req.user_id, req.sid);
  if (!socket) {
    res.status(422).end("Can't find a linked socket instance");
    return;
  }

  const payload = answerPostSchema.parse(req.body);

  const answer = new DbAnswer(
    payload.text,
    req.user,
    em.getReference(DbQuestion, payload.question),
  );
  await em.persistAndFlush(answer);

  QuestionManager.answerQuestion(answer);
}) satisfies RequestHandler;
