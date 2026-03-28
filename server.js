const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    io.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('start-session', (roomId) => {
    io.to(roomId).emit('start-countdown');
  });

  socket.on('capture-photo', (roomId, photoIndex, imageData) => {
    io.to(roomId).emit('receive-photo', socket.id, photoIndex, imageData);
  });

  socket.on('ready-for-photos', (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size === 2) {
      io.to(roomId).emit('both-ready');
    }
  });
});

server.listen(4000);
