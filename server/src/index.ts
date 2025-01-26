import { RequestContext } from "@mikro-orm/core";
import cookieParser from "cookie-parser";
import express, { ErrorRequestHandler, json } from "express";
import http from "http";
import process from "node:process";
import { ZodError } from "zod";
import { authHandler, magic8SessionIdHeaderName } from "./auth.js";
import { config } from "./config.js";
import db, { em } from "./db.js";
import { HttpError } from "./http_error.js";
import { io } from "./realtime.js";
import { appRouter } from "./routes/index.js";
import cors from "cors";
const app = express();

app.use(
  cors({
    allowedHeaders: [magic8SessionIdHeaderName, "content-type"],
    credentials: !Boolean(process.env.SAME_ORIGIN),
    origin: true,
  }),
);
app.use(cookieParser());
app.use(json());
app.use((_req, _res, next) => {
  RequestContext.create(db.em, next);
});
app.use(authHandler);
app.use("/api", appRouter);

app.use(((err, _req, res, next) => {
  if (err instanceof ZodError) {
    res.status(400).end(err.toString());
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).end(err.rawMessage);
    return;
  }

  next(err);
}) satisfies ErrorRequestHandler);

app.use(async (_req, _res, next) => {
  await em.flush();
  next();
});

const server = http.createServer(app);
server.listen(config.port, () => {
  console.log(`listening on *:${config.port}`);
});
io.listen(server);
