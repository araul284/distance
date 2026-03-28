import React from 'react'

/**
 * WoodFrame — the outer booth casing that wraps every page.
 * Renders the wood-grain background with dark-red double border,
 * a camera lens cutout at the top (optional), and the 
 * "made with love :3" watermark at the bottom.
 */
export default function WoodFrame({ children, showCamera = false, className = '' }) {
  return (
    <div className="wood-bg min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Outer glow/shadow */}
      <div
        className={`
          relative w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl
          min-h-screen md:min-h-0 md:h-auto
          wood-bg booth-border
          flex flex-col items-center
          rounded-sm overflow-hidden
          shadow-2xl
          ${className}
        `}
        style={{
          boxShadow: '0 0 0 6px #C4A070, 0 8px 40px rgba(0,0,0,0.35)',
          paddingBottom: '40px',
        }}
      >
        {/* Inner border inset */}
        <div
          className="absolute inset-3 pointer-events-none"
          style={{ border: '1px solid #8B1A1A', borderRadius: '2px', opacity: 0.6 }}
        />

        {/* Camera lens — only on booth page */}
        {showCamera && (
          <div className="flex flex-col items-center mt-8 mb-2 z-10">
            <div className="camera-lens" />
          </div>
        )}

        {/* Page content */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center flex-1 px-4">
          {children}
        </div>

        {/* Watermark */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
          <span className="watermark text-xs">made with love :3</span>
        </div>
      </div>
    </div>
  )
}