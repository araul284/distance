import { useEffect, useRef, useState, useCallback } from 'react'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export default function useWebRTC(socket, roomId, isHost) {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerRef = useRef(null)
  const localStreamRef = useRef(null)
  const pendingCandidatesRef = useRef([])

  const [localReady, setLocalReady] = useState(false)
  const [remoteReady, setRemoteReady] = useState(false)
  const [error, setError] = useState(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      setLocalReady(true)
      return stream
    } catch (err) {
      console.error('Camera error:', err)
      setError('Camera access denied. Please allow camera access.')
      return null
    }
  }, [])

  const createPeer = useCallback((stream) => {
    const peer = new RTCPeerConnection(ICE_SERVERS)
    peerRef.current = peer

    stream.getTracks().forEach(track => peer.addTrack(track, stream))

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
        setRemoteReady(true)
      }
    }

    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { roomId, candidate: event.candidate })
      }
    }

    return peer
  }, [socket, roomId])

  const initiateCall = useCallback(async (stream) => {
    const peer = createPeer(stream)
    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)
    socket.emit('offer', { roomId, offer })
  }, [createPeer, socket, roomId])

  useEffect(() => {
    if (!socket || !roomId) return

    const init = async () => {
      const stream = await startCamera()
      if (!stream) return

      if (isHost) {
        socket.on('partner-ready', async () => {
          await initiateCall(stream)
        })
      } else {
        socket.emit('partner-ready', { roomId })
      }
    }

    init()

    socket.on('offer', async ({ offer }) => {
      if (!localStreamRef.current) return
      const peer = createPeer(localStreamRef.current)
      await peer.setRemoteDescription(new RTCSessionDescription(offer))

      for (const c of pendingCandidatesRef.current) {
        await peer.addIceCandidate(new RTCIceCandidate(c))
      }
      pendingCandidatesRef.current = []

      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      socket.emit('answer', { roomId, answer })
    })

    socket.on('answer', async ({ answer }) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer))
      }
    })

    socket.on('ice-candidate', async ({ candidate }) => {
      if (peerRef.current && peerRef.current.remoteDescription) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate))
      } else {
        pendingCandidatesRef.current.push(candidate)
      }
    })

    return () => {
      socket.off('partner-ready')
      socket.off('offer')
      socket.off('answer')
      socket.off('ice-candidate')
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      peerRef.current?.close()
    }
  }, [socket, roomId, isHost])

  const captureFrame = useCallback((videoEl, filter) => {
    if (!videoEl) return null
    const canvas = document.createElement('canvas')
    canvas.width = videoEl.videoWidth || 640
    canvas.height = videoEl.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (filter && filter !== 'none') ctx.filter = filter
    ctx.drawImage(videoEl, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  return { localVideoRef, remoteVideoRef, localReady, remoteReady, captureFrame, error, localStream: localStreamRef }
}