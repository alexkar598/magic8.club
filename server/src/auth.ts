import { RequestHandler } from "express-serve-static-core";
import { em } from "./db.ts";
import { DbUser } from "./entities/user.ts";

export const magic8TokenCookieName = "magic8_token";
export const magic8SessionIdHeaderName = "Magic8SessionId";

export const authHandler: RequestHandler = async (req, res, next) => {
  const sid = req.header(magic8SessionIdHeaderName);
  if (sid == null) {
    res.status(400).end("Session ID missing");
    return;
  }

  req.sid = sid;

  let token = req.cookies[magic8TokenCookieName] as string | undefined;

  const user = await resolveOrCreate(token);
  res.cookie(magic8TokenCookieName, user.token, {
    httpOnly: true,
  });

  req.user_id = user.id;
  req.user = user;

  next();
};

export async function resolveOrCreate(token: string | null | undefined) {
  // If we have a token, get the associated user id
  let user =
    token == null ? null : ((await em.findOne(DbUser, { token })) ?? null);

  // No account
  if (user == null) {
    user = new DbUser();
    await em.persistAndFlush(user);
  }

  return user;
}
