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
      <div className="text-center mt-60 mb-60">
        <div className="w-40 h-[2px] bg-booth-red mx-auto mb-4" />

          <h2
            className="text-booth-red"
            style={{
              fontFamily: 'Gravitas One',
              fontSize: 'clamp(14px, 2vw, 16px)',
            }}
          >
            Memories that matter.
          </h2>

        <div 
        className="w-30 h-[2px] bg-booth-red mx-auto mt-4 mb-8" 
        style ={{ marginBottom: '8rem' }}
        />
      </div>

      {/* Receipt slot with the card */}
      <div
        className={`w-[250px] flex flex-col items-center transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'
      }`}
      >
        <ReceiptSlot>
          {/* Card content */}
          <div className="flex flex-col items-center w-[250px]">
            {/* Logo / title */}
            <div className="text-center mx-10 mt-[20%] mb-[20%]">
              <h1
                className="text-booth-red"
                style={{
                  margin: 0,
                  fontFamily: "'Gravitas One'",
                  fontSize: '30px',
                }}
              >
                Distance
              </h1>
              <h1
                className="text-booth-red"
                style={{
                  margin: -20,
                  fontFamily: "'Allison'",
                  fontSize: '70px',
                  fontWeight: 500,
                }}
              >
                Booth
              </h1>
            </div>

            {/* Divider */}
            <div className="w-32 h-px bg-booth-red mb-6" />

            {/* Enter button */}
            <button
              onClick={() => navigate('/invite')}
              className="w-[120px] h-[30px] bg-booth-red rounded-full px-10 py-6 text-white font-bold transition-all duration-200 hover:brightness-90 active:scale-95"
              style={{
                fontSize: '8px',
                fontFamily: "'Gravitas One', cursive",
                color: '#ffffff',
              }}
            >
              Enter booth
            </button>
          </div>
        </ReceiptSlot>
      </div>
    </WoodFrame>
  )
}