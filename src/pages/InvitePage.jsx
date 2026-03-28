import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import WoodFrame from '../components/WoodFrame'

// Generate a short random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export default function InvitePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [roomId] = useState(() => searchParams.get('room') || generateRoomId())
  const [copied, setCopied] = useState(false)
  const [partnerJoined, setPartnerJoined] = useState(false)
  const [visible, setVisible] = useState(false)
  const pollRef = useRef(null)

  const inviteLink = `${window.location.origin}/booth/${roomId}?guest=1`

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)

    // Poll localStorage for partner join signal (demo mode)
    // In production this would be a socket event
    pollRef.current = setInterval(() => {
      const joined = localStorage.getItem(`room-${roomId}-partner`)
      if (joined) {
        setPartnerJoined(true)
        clearInterval(pollRef.current)
        setTimeout(() => navigate(`/booth/${roomId}?host=1`), 1200)
      }
    }, 1000)

    return () => clearInterval(pollRef.current)
  }, [roomId, navigate])

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleEnterAlone = () => {
    // Host enters the booth directly; partner will join via link
    navigate(`/booth/${roomId}?host=1`)
  }

  return (
    <WoodFrame>
      <div className="w-full flex flex-col items-center pb-8">
        {/* Invite Card */}
        <div
          className={`w-[85%] max-w-md rounded-[28px] px-6 py-8 transition-all duration-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{
            background: '#8B1A1A',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            minHeight: 220,
          }}
        >
          {/* Heading */}
          <h2
            style={{
              fontFamily: "'Allison'",
              fontSize: 'clamp(32px, 8vw, 44px)',
              lineHeight: 1.1,
              letterSpacing: '0.04em',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '0.75rem',
            }}
          >
            Invite your partner
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "'Gravitas One'",
              fontSize: '12px',
              lineHeight: 1.5,
              letterSpacing: '0.06em',
              color: '#ffffff',
              opacity: 0.9,
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            Send this link to the person you<br />
            want to take photos with:
          </p>

          {/* Link box */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-between bg-[#EDEDED] rounded-full shadow-inner"
            style={{ padding: '10px 16px', minHeight: 44, boxSizing: 'border-box' }}
          >
            <span
              style={{
                fontFamily: "'Gravitas One'",
                fontSize: '11px',
                color: '#9A9A9A',
                letterSpacing: '0.04em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
                textAlign: 'left',
              }}
            >
              {copied ? '✓ Copied!' : inviteLink}
            </span>

            {/* Icon — fixed size so it never causes reflow */}
            <span style={{ flexShrink: 0, marginLeft: 8, display: 'flex', alignItems: 'center' }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8B1A1A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </span>
          </button>
        </div>

        {/* Status area */}
        <div className="mt-12 flex flex-col items-center">
          <div className="w-40 h-[1px] bg-booth-red opacity-60 mb-4" />

          {partnerJoined ? (
            <p
              className="text-booth-red text-center animate-pulse"
              style={{
                fontFamily: "'Gravitas One'",
                fontSize: '14px',
                letterSpacing: '0.08em',
              }}
            >
              ✓ Partner joined! Starting booth...
            </p>
          ) : (
            <p
              className="text-booth-red text-center"
              style={{
                fontFamily: "'Gravitas One'",
                fontSize: '14px',
                letterSpacing: '0.08em',
              }}
            >
              Waiting for them to join...
            </p>
          )}

          <div className="w-24 h-px bg-booth-red opacity-50 mt-4 mb-6" />

          {/* Enter alone option */}
          <button
            onClick={handleEnterAlone}
            className="text-booth-red opacity-60 hover:opacity-100 transition-opacity text-sm underline rounded-full px-3 py-1"
            style={{ 
              fontSize: '11px',
              fontFamily: "'Gravitas One', cursive" }}
          >
            Or enter the booth alone →
          </button>
        </div>
      </div>
    </WoodFrame>
  )
}