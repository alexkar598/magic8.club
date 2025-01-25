import { RequestHandler } from "express-serve-static-core";
import db from "./db";
import { v4 as uuidv4 } from "uuid";

const magic8TokenCookieName = "magic8_token";

export const authHandler: RequestHandler = async (req, res, next) => {
  let token = req.cookies[magic8TokenCookieName] as string | undefined;

  // If we have a token, get the associated user id
  let user_id =
    token == null ? null : ((await db.tokens.get<string>(token)) ?? null);

  // No account
  if (user_id == null) {
    token = uuidv4();
    user_id = uuidv4();

    await db.tokens.set(token, user_id);
    res.cookie(magic8TokenCookieName, token, {
      httpOnly: true,
    });
  }

  req.user_id = user_id;

  next();
};
