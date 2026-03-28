import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import WoodFrame from '../components/WoodFrame'
import useWebRTC from '../hooks/useWebRTC'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

const FILTERS = [
  {
    id: 'normal',
    label: 'normal',
    css: 'none',
    preview: 'none',
  },
  {
    id: 'bw',
    label: 'b&w',
    css: 'grayscale(100%) contrast(1.1)',
    preview: 'grayscale(100%)',
  },
  {
    id: 'cool',
    label: 'cool',
    css: 'hue-rotate(10deg) saturate(1.4) brightness(1.05)',
    preview: 'hue-rotate(30deg) saturate(1.4)',
  },
  {
    id: 'vintage',
    label: 'vintage',
    css: 'sepia(100%) contrast(1.3) brightness(0.85) saturate(0.9)',
    preview: 'sepia(60%) contrast(1.1)',
  },
]

const PHOTO_COUNT = 4
const COUNTDOWN_FROM = 3

export default function BoothPage() {
  const { roomId } = useParams()
  const [searchParams] = useSearchParams()
  const isHost = searchParams.get('host') === '1'
  const isGuest = searchParams.get('guest') === '1'
  const navigate = useNavigate()

  const socketRef = useRef(null)
  const [selectedFilter, setSelectedFilter] = useState('normal')
  const [countdown, setCountdown] = useState(null)
  const [flash, setFlash] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [photosTaken, setPhotosTaken] = useState([])
  const [status, setStatus] = useState('Setting up cameras...')

  const { localVideoRef, remoteVideoRef, localReady, remoteReady, captureFrame, error } = useWebRTC(
    socketRef.current,
    roomId,
    isHost
  )

  // Signal that guest has arrived
  useEffect(() => {
    if (isGuest) {
      localStorage.setItem(`room-${roomId}-partner`, '1')
    }

    // Connect socket
    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    socketRef.current = socket
    socket.emit('join-room', { roomId, role: isHost ? 'host' : 'guest' })

    // Listen for synchronized countdown from host
    socket.on('start-countdown', () => doCountdown())

    return () => {
      socket.disconnect()
      if (isGuest) localStorage.removeItem(`room-${roomId}-partner`)
    }
  }, [roomId, isHost, isGuest])

  useEffect(() => {
    if (localReady && remoteReady) setStatus('')
    else if (localReady) setStatus('Waiting for partner...')
    else setStatus('Starting camera...')
  }, [localReady, remoteReady])

  const currentFilter = FILTERS.find(f => f.id === selectedFilter)

  const doCountdown = useCallback(() => {
    if (capturing) return
    setCapturing(true)
    setPhotosTaken([])

    let photoIndex = 0

    const takeNextPhoto = (remaining) => {
      if (remaining === 0) {
        // All photos taken — navigate to print
        setTimeout(() => {
          setCapturing(false)
          navigate(`/print/${roomId}`, { state: { photos: photosTaken } })
        }, 600)
        return
      }

      setCountdown(COUNTDOWN_FROM)

      let count = COUNTDOWN_FROM
      const countInterval = setInterval(() => {
        count--
        if (count <= 0) {
          clearInterval(countInterval)
          setCountdown(null)

          // Flash and capture
          setFlash(true)
          setTimeout(() => setFlash(false), 400)

          const localFrame = captureFrame(localVideoRef.current, currentFilter.css)
          const remoteFrame = captureFrame(remoteVideoRef.current, currentFilter.css)

          setPhotosTaken(prev => {
            const updated = [...prev, { local: localFrame, remote: remoteFrame }]
            if (updated.length === PHOTO_COUNT) {
              setTimeout(() => {
                navigate(`/print/${roomId}`, {
                  state: { photos: updated, filter: selectedFilter },
                })
              }, 800)
            }
            return updated
          })

          photoIndex++
          if (photoIndex < PHOTO_COUNT) {
            setTimeout(() => takeNextPhoto(remaining - 1), 1200)
          }
        } else {
          setCountdown(count)
        }
      }, 1000)
    }

    takeNextPhoto(PHOTO_COUNT)
  }, [capturing, captureFrame, localVideoRef, remoteVideoRef, currentFilter, navigate, roomId, selectedFilter])

  const handleStart = () => {
    if (socketRef.current) {
      socketRef.current.emit('start-countdown', { roomId })
    }
    doCountdown()
  }

  const filterStyle = { filter: currentFilter?.css !== 'none' ? currentFilter.css : undefined }

  return (
    <WoodFrame showCamera className="pb-8">
      {/* Flash overlay */}
      {flash && <div className="flash-overlay" />}

      {/* "look here" label */}
      <div className="flex items-center justify-center gap-8 mt-2 mb-3 w-full">
        <span
          className="text-booth-red"
          style={{ fontFamily: "'Gravitas One', cursive", fontSize: 'clamp(14px, 4vw, 18px)', letterSpacing: '0.08em' }}
        >
          look
        </span>
        <div style={{ width: 40 }} /> {/* camera lens space */}
        <span
          className="text-booth-red"
          style={{ fontFamily: "'Gravitas One', cursive", fontSize: 'clamp(14px, 4vw, 18px)', letterSpacing: '0.08em' }}
        >
          here
        </span>
      </div>

      {/* Video frames */}
      <div
        className="w-5/6 rounded-xl overflow-hidden shadow-lg relative"
        style={{
          background: '#1a1a1a',
          border: '6px solid #E8D5BC',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Countdown overlay */}
        {countdown !== null && (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <span key={countdown} className="countdown-number">{countdown}</span>
          </div>
        )}

        <div className="flex">
          {/* YOU */}
          <div className="flex-1 relative">
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
              <div className="rec-dot" />
              <span
                className="text-white text-xs font-bold"
                style={{ fontFamily: "'Gravitas One', cursive", letterSpacing: '0.1em', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
              >
                YOU
              </span>
            </div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full"
              style={{ aspectRatio: '3/4', objectFit: 'cover', ...filterStyle, display: 'block', transform: 'scaleX(-1)' }}
            />
          </div>

          {/* Divider */}
          <div style={{ width: 2, background: '#E8D5BC', flexShrink: 0 }} />

          {/* THEM */}
          <div className="flex-1 relative">
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
              <span
                className="text-white text-xs font-bold"
                style={{ fontFamily: "'Gravitas One', cursive", letterSpacing: '0.1em', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
              >
                THEM
              </span>
              <div className="rec-dot" style={{ opacity: remoteReady ? 1 : 0.3 }} />
            </div>
            {remoteReady ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full"
                style={{ aspectRatio: '3/4', objectFit: 'cover', ...filterStyle, display: 'block', transform: 'scaleX(-1)' }}
              />
            ) : (
              <div
                className="w-full flex items-center justify-center bg-gray-900"
                style={{ aspectRatio: '3/4' }}
              >
                <div className="text-center">
                  <div className="spinner mx-auto mb-2" />
                  <p className="text-white text-xs opacity-60" style={{ fontFamily: "'Gravitas One', cursive" }}>
                    {status || 'Connecting...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter section */}
      <div className="w-5/6 mt-5">
        <p
          className="text-booth-red mb-3"
          style={{ fontFamily: "'Allison', cursive", fontSize: 'clamp(18px, 5vw, 24px)' }}
        >
          choose a filter
        </p>

        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex flex-col items-center gap-1 group ${
                selectedFilter === filter.id ? 'opacity-100' : 'opacity-70 hover:opacity-90'
              }`}
            >
              {/* Thumbnail preview */}
              <div
                className="rounded overflow-hidden shadow-md transition-all duration-200"
                style={{
                  width: 'clamp(58px, 18vw, 74px)',
                  height: 'clamp(44px, 13vw, 56px)',
                  border: selectedFilter === filter.id ? '2px solid #8B1A1A' : '2px solid transparent',
                  background: '#555',
                  transform: selectedFilter === filter.id ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Placeholder gradient that shows filter effect */}
                <div
                  className="w-full h-full"
                  style={{
                    background: 'linear-gradient(135deg, #999 0%, #666 50%, #888 100%)',
                    filter: filter.preview !== 'none' ? filter.preview : undefined,
                  }}
                />
              </div>
              {/* Label */}
              <span
                className="text-booth-red"
                style={{
                  fontFamily: "'Gravitas One', cursive",
                  fontSize: 'clamp(9px, 2.5vw, 11px)',
                  letterSpacing: '0.05em',
                  padding: '2px 8px',
                  background: selectedFilter === filter.id ? '#8B1A1A' : 'transparent',
                  color: selectedFilter === filter.id ? 'white' : '#8B1A1A',
                  borderRadius: 20,
                  transition: 'all 0.2s ease',
                }}
              >
                {filter.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Photo count progress */}
      {photosTaken.length > 0 && (
        <div className="flex gap-1.5 mt-4">
          {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: 8,
                height: 8,
                background: i < photosTaken.length ? '#8B1A1A' : 'rgba(139,26,26,0.25)',
              }}
            />
          ))}
        </div>
      )}

      {/* Capture button */}
      {!capturing && (
        <button
          onClick={handleStart}
          disabled={!localReady}
          className="btn-booth mt-5 px-10 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontSize: '13px', letterSpacing: '0.08em' }}
        >
          {localReady ? `📸 Take ${PHOTO_COUNT} photos` : 'Starting camera...'}
        </button>
      )}

      {/* Error display */}
      {error && (
        <p className="text-red-600 text-sm mt-3 text-center" style={{ fontFamily: "'Gravitas One', cursive" }}>
          {error}
        </p>
      )}
    </WoodFrame>
  )
}