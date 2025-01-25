import cookieParser from "cookie-parser";
import express, { ErrorRequestHandler, json } from "express";
import http from "http";
import { ZodError } from "zod";
import { authHandler } from "./auth";
import { config } from "./config";
import db from "./db";
import { io } from "./realtime";
import { appRouter } from "./routes";

const app = express();

app.use(cookieParser());
app.use(json());
app.use(authHandler);
app.use(appRouter);

app.use(((err, req, res, next) => {
  if (err instanceof ZodError) {
    res.status(400).end(err.toString());
    return;
  }

  next(err);
}) satisfies ErrorRequestHandler);

app.get("/", async (req, res) => {
  const counter = (await db.test.get<number>(req.user_id)) ?? 1;
  await db.test.set(req.user_id, counter + 1);

  res.send(`<h1>You've been here ${counter} times</h1>`);
});

const server = http.createServer(app);
server.listen(config.port, () => {
  console.log(`listening on *:${config.port}`);
});
io.listen(server);
