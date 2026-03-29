import React from 'react'

/**
 * ReceiptSlot — the dark red "printer slot" that sits above
 * the white paper receipt card on the landing / print pages.
 */
export default function ReceiptSlot({ children, className = '' }) {
  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* The slot bar */}
      <div
        className="receipt-slot w-5/6 h-3/4 border-10 border-solid border-booth-red rounded-lg relative before:absolute before:top-1/2 before:left-2 before:right-2 before:h-2.5 before:bg-white before:translate-y-1/2 before:rounded-full"
        style={{
          background: 'linear-gradient(to bottom, #7a1515, #6B1414)',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.1)',
        }}
      />

      {/* Paper coming out of the slot */}
      <div
        className="w-5/6 paper flex flex-col items-center"
        style={{ minHeight: 280, borderRadius: '0 0 4px 4px', position: 'relative' }}
      >
        {children}

        {/* Scalloped tear edge at bottom */}
        {/* <div className="absolute bottom-8 left-0 right-0 overflow-hidden" style={{ height: 18 }}>
          <svg
            viewBox="0 0 300 18"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <circle key={i} cx={i * 16 + 8} cy={18} r={8} fill="var(--wood-light)" />
            ))}
          </svg>
        </div> */}
      </div>
    </div>
  )
}