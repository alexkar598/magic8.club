import { RequestHandler } from "express-serve-static-core";
import { questionPostSchema } from "../../public_types/question.ts";

export default (async (req, res) => {
  const question = await questionPostSchema.parseAsync(req.body);

  res.write(question.text);
  res.end();
}) satisfies RequestHandler;
