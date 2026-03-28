import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import WoodFrame from '../components/WoodFrame'

// Combine local + remote into a side-by-side strip frame
function combineFrames(local, remote, filter) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const W = 800
    const H = 300
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // White background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, W, H)

    const loadImg = (src) =>
      new Promise((res) => {
        if (!src) { res(null); return }
        const img = new Image()
        img.onload = () => res(img)
        img.onerror = () => res(null)
        img.src = src
      })

    Promise.all([loadImg(local), loadImg(remote)]).then(([imgL, imgR]) => {
      const half = W / 2

      if (imgL) {
        ctx.drawImage(imgL, 0, 0, half, H)
      } else {
        ctx.fillStyle = '#ddd'
        ctx.fillRect(0, 0, half, H)
      }

      if (imgR) {
        ctx.drawImage(imgR, half, 0, half, H)
      } else {
        ctx.fillStyle = '#ccc'
        ctx.fillRect(half, 0, half, H)
      }

      resolve(canvas.toDataURL('image/jpeg', 0.92))
    })
  })
}

export default function PrintPage() {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const photos = location.state?.photos || []
  const _filter = location.state?.filter || 'normal'

  const [combinedFrames, setCombinedFrames] = useState([])
  const [printStarted, setPrintStarted] = useState(false)
  const stripRef = useRef(null)

  useEffect(() => {
    const process = async () => {
      const results = []
      for (const photo of photos) {
        const combined = await combineFrames(photo.local, photo.remote, _filter)
        results.push(combined)
      }
      setCombinedFrames(results)

      // Start print animation after a short delay
      setTimeout(() => setPrintStarted(true), 400)

      // Navigate to final page after print animation completes
      setTimeout(() => {
        navigate(`/final`, {
          state: { frames: results, filter: _filter, roomId },
        })
      }, 3200)
    }

    if (photos.length > 0) {
      process()
    } else {
      // No photos — demo with placeholder frames
      const placeholders = Array.from({ length: 4 }, () => null)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCombinedFrames(placeholders)
      setTimeout(() => setPrintStarted(true), 400)
      setTimeout(() => navigate('/final', { state: { frames: placeholders, filter: 'normal' } }), 3200)
    }
  }, [_filter, navigate, photos, roomId])

  return (
    <WoodFrame>
      {/* Receipt slot at top */}
      <div className="w-full flex flex-col items-center">
        {/* The slot bar */}
        <div
          className="w-5/6 h-10 flex-shrink-0"
          style={{
            background: 'linear-gradient(to bottom, #7a1515, #6B1414)',
            borderRadius: '10px 10px 0 0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            position: 'relative',
            zIndex: 10,
          }}
        />

        {/* Animated strip coming out */}
        <div
          className="w-5/6 overflow-hidden"
          style={{ position: 'relative', zIndex: 5 }}
        >
          <div
            ref={stripRef}
            style={{
              background: 'white',
              padding: '16px 16px 0',
              transformOrigin: 'top center',
              animation: printStarted ? 'printDown 2.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards' : undefined,
              clipPath: printStarted ? undefined : 'inset(0 0 100% 0)',
            }}
          >
            {/* Photo frames */}
            {(combinedFrames.length > 0 ? combinedFrames : Array(4).fill(null)).map((src, i) => (
              <div key={i}>
                {/* Frame */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '8/3',
                    background: src ? 'transparent' : '#e8e8e8',
                    overflow: 'hidden',
                    marginBottom: 4,
                  }}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={`Frame ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#e0d6d6' }} />
                  )}
                </div>
                {i < 3 && <div className="strip-divider" />}
              </div>
            ))}

            {/* Watermark */}
            <div className="flex justify-center py-4">
              <span className="watermark" style={{ fontSize: 13 }}>made with love :3</span>
            </div>

            {/* Scalloped bottom */}
            <div style={{ overflow: 'hidden', height: 18, marginTop: -4 }}>
              <svg viewBox="0 0 300 18" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }} preserveAspectRatio="none">
                {Array.from({ length: 25 }).map((_, i) => (
                  <circle key={i} cx={i * 13 + 6} cy={18} r={8} fill="#D4B896" />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Status text */}
      <p
        className="mt-6 text-booth-red opacity-70"
        style={{ fontFamily: "'Gravitas One', cursive", fontSize: 13, letterSpacing: '0.1em', animation: 'pulse 1.5s ease infinite' }}
      >
        developing your memories...
      </p>
    </WoodFrame>
  )
}