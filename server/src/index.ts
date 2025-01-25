import { raw, RequestContext } from "@mikro-orm/core";
import cookieParser from "cookie-parser";
import express, { ErrorRequestHandler, json } from "express";
import http from "http";
import { ZodError } from "zod";
import { authHandler } from "./auth";
import { config } from "./config";
import db, { em } from "./db";
import { DbUser } from "./entities/user.ts";
import { io } from "./realtime";
import { appRouter } from "./routes";

const app = express();

app.use(cookieParser());
app.use(json());
app.use((_req, _res, next) => {
  RequestContext.create(db.em, next);
});
app.use(authHandler);
app.use(appRouter);

app.use(((err, _req, res, next) => {
  if (err instanceof ZodError) {
    res.status(400).end(err.toString());
    return;
  }

  next(err);
}) satisfies ErrorRequestHandler);

app.get("/", async (req, res) => {
  const userRef = em.getReference(DbUser, req.user_id);
  userRef.counter = raw("counter + 1");

  await em.flush();

  res.send(`<h1>You've been here ${userRef.counter} times</h1>`);
});

app.use(async (_req, _res, next) => {
  await em.flush();
  next();
});

const server = http.createServer(app);
server.listen(config.port, () => {
  console.log(`listening on *:${config.port}`);
});
io.listen(server);
