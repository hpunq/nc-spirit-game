import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("A connection has been made!")
});

httpServer.listen(3000);
// const io = require('socket.io')(3000)

// io.on('connection', socket => {
//     console.log(socket.id)
// })

// const app = express();
// const io = new Server(httpServer);

// const port = 3000;

// app.get("/", (req, res) => {
//   res.sendFile("Hello world!");
// });

// io.on("connection", (socket) => {
//   console.log("a user connected");
//   socket.emit("serverToClient", "Hello client!");
//   socket.on('clientToServer', data => {
//     console.log(data)
//   })
// });

// httpServer.listen(port);

// function getAllPlayers() {
//   var players = [];
//   Object.keys(io.sockets.connected).forEach(function (socketID) {
//     var player = io.sockets.connected[socketID].player;
//     if (player) players.push(player);
//   });
//   return players;
// }

// function randomInt(low, high) {
//   return Math.floor(Math.random() * (high - low) + low);
// }
