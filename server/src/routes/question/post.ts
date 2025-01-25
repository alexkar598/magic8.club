import { RequestHandler } from "express-serve-static-core";
import { em } from "../../db.ts";
import { DbQuestion } from "../../entities/question.ts";
import {
  questionPostSchema,
  questionSchema,
} from "../../public_types/question.ts";

export default (async (req, res) => {
  const question = await questionPostSchema.parseAsync(req.body);

  const dbQuestion = new DbQuestion(question.text, req.user);
  em.persist(dbQuestion);

  res.send(await questionSchema.parseAsync(dbQuestion));
  res.end();
}) satisfies RequestHandler;
