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
          className={`w-5/6 rounded-2xl p-6 md:p-8 shadow-xl transition-all duration-600 ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            background: 'linear-gradient(145deg, #8B1A1A, #6B1414)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Heading */}
          <h2
            className="text-white text-center mb-4"
            style={{
              fontFamily: "'Allison', cursive",
              fontSize: 'clamp(28px, 7vw, 40px)',
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            Invite your partner
          </h2>

          {/* Subtitle */}
          <p
            className="text-white text-center mb-6 opacity-90"
            style={{
              fontFamily: "'Gravitas One', cursive",
              fontSize: 'clamp(12px, 3vw, 14px)',
              lineHeight: 1.6,
            }}
          >
            Send this link to the person you<br />want to take photos with:
          </p>

          {/* Link box */}
          <button
            onClick={handleCopy}
            className="w-full invite-box text-left hover:shadow-md transition-shadow duration-200 group"
          >
            <span
              className="flex-1 text-booth-red truncate"
              style={{
                fontFamily: "'Gravitas One', cursive",
                fontSize: 'clamp(10px, 2.5vw, 12px)',
                color: '#8B1A1A',
              }}
            >
              {copied ? '✓ Copied!' : inviteLink}
            </span>
            {/* Chain link icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8B1A1A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
        </div>

        {/* Status area */}
        <div className="mt-8 flex flex-col items-center slide-in slide-in-delay-2">
          <div className="w-24 h-px bg-booth-red opacity-50 mb-4" />

          {partnerJoined ? (
            <p
              className="text-booth-red text-center animate-pulse"
              style={{ fontFamily: "'Gravitas One', cursive", letterSpacing: '0.05em', fontSize: 14 }}
            >
              ✓ Partner joined! Starting booth...
            </p>
          ) : (
            <p
              className="text-booth-red text-center"
              style={{ fontFamily: "'Gravitas One', cursive", letterSpacing: '0.05em', fontSize: 14 }}
            >
              Waiting for them to join.
            </p>
          )}

          <div className="w-24 h-px bg-booth-red opacity-50 mt-4 mb-6" />

          {/* Enter alone option */}
          <button
            onClick={handleEnterAlone}
            className="text-booth-red opacity-60 hover:opacity-100 transition-opacity text-sm underline"
            style={{ fontFamily: "'Gravitas One', cursive" }}
          >
            Or enter the booth alone →
          </button>
        </div>
      </div>
    </WoodFrame>
  )
}