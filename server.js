import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

let players = {};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Add new player
  players[socket.id] = { x: 100, y: 450 };
  socket.emit("currentPlayers", players); // Send current players to the new player
  socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] }); // Notify other players

  // Update player movement
  socket.on("playerMoved", (movementData) => {
    if (players[socket.id]) {
      players[socket.id] = { ...players[socket.id], ...movementData };
      io.emit("playerUpdated", { id: socket.id, ...movementData });
    }
  });

  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
