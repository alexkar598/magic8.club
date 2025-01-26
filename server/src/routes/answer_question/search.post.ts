import { RequestHandler } from "express-serve-static-core";
import QuestionManager from "../../QuestionManager.ts";
import { getSocket } from "../../realtime.ts";

export default (async (req, res) => {
  const socket = getSocket(req.user_id, req.sid);
  if (!socket) {
    res.status(422).end("Can't find a linked socket instance");
    return;
  }

  QuestionManager.subscribeAsAnswerer(socket);

  res.status(204).end();
}) satisfies RequestHandler;
