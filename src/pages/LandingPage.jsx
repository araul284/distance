import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WoodFrame from '../components/WoodFrame'
import ReceiptSlot from '../components/ReceiptSlot'

export default function LandingPage() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Slight delay so the receipt "prints" in on load
    setTimeout(() => setVisible(true), 200)
  }, [])

  return (
    <WoodFrame>
      {/* Header text */}
      <div className="text-center mb-6 slide-in slide-in-delay-1">
        <div className="w-24 h-px bg-booth-red mx-auto mb-3 opacity-70" />
        <h2
          className="text-booth-red text-lg font-display tracking-widest"
          style={{ 
            fontFamily: 'Gravitas One',
            fontSize: 'clamp(15px, 5vw, 10px)', 
            letterSpacing: '0.15em' 
          }}
        >
          Memories that matter.
        </h2>
        <div className="w-24 h-px bg-booth-red mx-auto mt-3 opacity-70" />
      </div>

      {/* Receipt slot with the card */}
      <div
        className={`w-full flex flex-col items-center transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
        }`}
      >
        <ReceiptSlot>
          {/* Card content */}
          <div className="flex flex-col items-center px-8 pt-10 pb-16">
            {/* Logo / title */}
            <div className="text-center mb-8">
              <h1
                className="text-booth-red leading-tight"
                style={{
                  fontFamily: "'Gravitas One', cursive",
                  fontSize: 'clamp(30px, 8vw, 40px)',
                  letterSpacing: '0.05em',
                }}
              >
                Distance
              </h1>
              <h1
                className="text-booth-red"
                style={{
                  fontFamily: "'Allison', cursive",
                  fontSize: 'clamp(36px, 10vw, 52px)',
                  lineHeight: 1.1,
                  fontWeight: 600,
                }}
              >
                Booth
              </h1>
            </div>

            {/* Divider */}
            <div className="w-32 h-px bg-booth-red opacity-20 mb-8" />

            {/* Enter button */}
            <button
              onClick={() => navigate('/invite')}
              className="btn-booth px-10 py-3 text-base"
              style={{ fontSize: '13px', letterSpacing: '0.08em' }}
            >
              Enter booth
            </button>

            {/* Spacer for the scalloped edge */}
            <div className="h-8" />
          </div>
        </ReceiptSlot>
      </div>
    </WoodFrame>
  )
}