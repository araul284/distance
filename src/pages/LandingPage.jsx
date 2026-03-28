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
      <div className="text-center mt-10 mb-10">
  <div className="w-40 h-[1px] bg-booth-red mx-auto mb-4 opacity-60" />

  <h2
    className="text-booth-red"
    style={{
      fontFamily: 'Gravitas One',
      fontSize: 'clamp(14px, 2vw, 16px)',
      letterSpacing: '0.18em',
    }}
  >
    Memories that matter.
  </h2>

  <div className="w-40 h-[1px] bg-booth-red mx-auto mt-4 opacity-60" />
</div>

      {/* Receipt slot with the card */}
      <div
        className={`w-full flex flex-col items-center transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'
      }`}
      >
        <ReceiptSlot>
          {/* Card content */}
          <div className="flex flex-col items-center px-6 pt-12 pb-14 w-[220px]">
            {/* Logo / title */}
            <div className="text-center mb-6">
              <h1
                className="text-booth-red"
                style={{
                  fontFamily: "'Gravitas One'",
                  fontSize: '32px',
                  letterSpacing: '0.06em',
                  lineHeight: 1.1,
                }}
              >
                Distance
              </h1>

              <h1
                className="text-booth-red -mt-1"
                style={{
                  fontFamily: "'Allison'",
                  fontSize: '48px',
                  lineHeight: 1,
                  fontWeight: 500,
                }}
              >
                Booth
              </h1>
            </div>

            {/* Divider */}
            <div className="w-32 h-px bg-booth-red opacity-30 mb-6" />

            {/* Enter button */}
            <button
              onClick={() => navigate('/invite')}
              className="bg-booth-red rounded-full px-8 py-2 text-white font-bold transition-all duration-200 hover:brightness-90 active:scale-95"
              style={{
                fontSize: '12px',
                letterSpacing: '0.1em',
                fontFamily: "'Gravitas One', cursive",
                color: '#ffffff',
              }}
            >
              Enter booth
            </button>

            {/* Spacer for the scalloped edge */}
            <div className="h-6" />
          </div>
        </ReceiptSlot>
      </div>
    </WoodFrame>
  )
}