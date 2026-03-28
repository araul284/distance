import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = process.env.PORT || 3001

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// Track rooms: roomId -> { host: socketId, guest: socketId }
const rooms = new Map()

io.on('connection', (socket) => {
  console.log(`[+] Client connected: ${socket.id}`)

  // Join a room
  socket.on('join-room', ({ roomId, role }) => {
    socket.join(roomId)
    console.log(`[room:${roomId}] ${role} joined (${socket.id})`)

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { host: null, guest: null })
    }

    const room = rooms.get(roomId)
    if (role === 'host') {
      room.host = socket.id
    } else {
      room.guest = socket.id
      // Notify host that guest is ready to connect
      if (room.host) {
        io.to(room.host).emit('partner-ready', { guestId: socket.id })
      }
    }
  })

  // Guest signals readiness (alternative flow)
  socket.on('partner-ready', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (room && room.host) {
      io.to(room.host).emit('partner-ready')
    }
  })

  // WebRTC signaling — relay to the other person in room
  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', { offer })
    console.log(`[room:${roomId}] offer relayed`)
  })

  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', { answer })
    console.log(`[room:${roomId}] answer relayed`)
  })

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate })
  })

  // Synchronized countdown — host triggers, server broadcasts to whole room
  socket.on('start-countdown', ({ roomId }) => {
    console.log(`[room:${roomId}] countdown started by ${socket.id}`)
    io.to(roomId).emit('start-countdown')
  })

  socket.on('disconnect', () => {
    console.log(`[-] Client disconnected: ${socket.id}`)
    // Clean up rooms
    for (const [roomId, room] of rooms.entries()) {
      if (room.host === socket.id || room.guest === socket.id) {
        // Notify remaining participant
        socket.to(roomId).emit('partner-left')
        rooms.delete(roomId)
        console.log(`[room:${roomId}] deleted (participant left)`)
        break
      }
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`🎞  Distance Booth server running on http://localhost:${PORT}`)
})