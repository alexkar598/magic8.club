import {Server} from "socket.io";

export const io = new Server();


io.on('connection', (socket) => {
  console.log('a user connected');
});