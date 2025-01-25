import { RequestHandler } from "express-serve-static-core";
import { em } from "./db";
import { DbUser } from "./entities/user.ts";

const magic8TokenCookieName = "magic8_token";

export const authHandler: RequestHandler = async (req, res, next) => {
  let token = req.cookies[magic8TokenCookieName] as string | undefined;

  // If we have a token, get the associated user id
  let user_id =
    token == null ? null : ((await em.findOne(DbUser, { token }))?.id ?? null);

  // No account
  if (user_id == null) {
    const new_user = new DbUser();
    await em.persistAndFlush(new_user);
    token = new_user.token;
    user_id = new_user.id;

    res.cookie(magic8TokenCookieName, token, {
      httpOnly: true,
    });
  }

  req.user_id = user_id;

  next();
};
