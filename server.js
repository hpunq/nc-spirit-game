import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";

const app = express()
const server = createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log('a user connected');
});

httpServer.listen(3000);

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}