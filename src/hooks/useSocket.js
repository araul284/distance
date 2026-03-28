import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

/**
 * useSocket — manages the Socket.IO connection lifecycle.
 * Returns { socket, connected }
 */
export default function useSocket() {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    })

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(socketInstance)

    socketInstance.on('connect', () => setConnected(true))
    socketInstance.on('disconnect', () => setConnected(false))

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return { socket, connected }
}