import express from "express";
import http from "http";
import {config} from "./config";
import {io} from "./realtime";



const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(config.port, () => {
  console.log(`listening on *:${config.port}`);
});

io.listen(server)