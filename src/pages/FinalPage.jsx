import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import WoodFrame from '../components/WoodFrame'

export default function FinalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const frames = location.state?.frames || []
  const roomId = location.state?.roomId

  const [stripDataUrl, setStripDataUrl] = useState(null)
  const [visible, setVisible] = useState(false)

  // Build the full photostrip canvas for download
  useEffect(() => {
    setTimeout(() => setVisible(true), 200)

    const buildStrip = async () => {
      const FRAME_W = 600
      const FRAME_H = 225
      const PAD = 20
      const GAP = 6
      const WATERMARK_H = 50
      const TOTAL_H = PAD + frames.length * (FRAME_H + GAP) + WATERMARK_H + PAD

      const canvas = document.createElement('canvas')
      canvas.width = FRAME_W + PAD * 2
      canvas.height = TOTAL_H
      const ctx = canvas.getContext('2d')

      // White background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const loadImg = (src) =>
        new Promise((res) => {
          if (!src) { res(null); return }
          const img = new Image()
          img.onload = () => res(img)
          img.onerror = () => res(null)
          img.src = src
        })

      let y = PAD
      for (const src of frames) {
        const img = await loadImg(src)
        if (img) {
          ctx.drawImage(img, PAD, y, FRAME_W, FRAME_H)
        } else {
          ctx.fillStyle = '#e0d6d6'
          ctx.fillRect(PAD, y, FRAME_W, FRAME_H)
        }
        y += FRAME_H + GAP
      }

      // Watermark
      ctx.font = 'italic 18px "Allison", cursive'
      ctx.fillStyle = '#8B1A1A'
      ctx.textAlign = 'center'
      ctx.globalAlpha = 0.7
      ctx.fillText('made with love :3', canvas.width / 2, y + 30)
      ctx.globalAlpha = 1

      setStripDataUrl(canvas.toDataURL('image/jpeg', 0.95))
    }

    if (frames.length > 0) buildStrip()
  }, [frames])

  const handleDownload = () => {
    if (!stripDataUrl) return
    const a = document.createElement('a')
    a.href = stripDataUrl
    a.download = `distance-booth-${Date.now()}.jpg`
    a.click()
  }

  const handleRetake = () => {
    if (roomId) {
      navigate(`/booth/${roomId}?host=1`)
    } else {
      navigate('/invite')
    }
  }

  return (
    <WoodFrame>
      {/* Photostrip */}
      <div
        className={`w-full flex justify-center mt-8 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div
          className="paper"
          style={{
            width: '72%',
            padding: '16px 16px 0',
            borderRadius: '2px 2px 4px 4px',
          }}
        >
          {(frames.length > 0 ? frames : Array(4).fill(null)).map((src, i) => (
            <div key={i}>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '8/3',
                  overflow: 'hidden',
                  marginBottom: 4,
                  background: '#e0d6d6',
                }}
              >
                {src && (
                  <img
                    src={src}
                    alt={`Strip frame ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </div>
              {i < (frames.length || 4) - 1 && <div className="strip-divider" />}
            </div>
          ))}

          {/* Watermark */}
          <div className="flex justify-center py-4">
            <span className="watermark" style={{ fontSize: 12 }}>made with love :3</span>
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

      {/* Action buttons */}
      <div
        className={`flex gap-3 mt-6 mb-4 w-5/6 transition-all duration-700 delay-300 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <button
          onClick={handleDownload}
          className="flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:brightness-90 active:scale-95"
          style={{
            background: 'linear-gradient(145deg, #8B1A1A, #6B1414)',
            fontFamily: "'Gravitas One', cursive",
            fontSize: 'clamp(12px, 3.5vw, 15px)',
            letterSpacing: '0.06em',
            boxShadow: '0 4px 16px rgba(139,26,26,0.45)',
          }}
        >
          Download
        </button>

        <button
          onClick={handleRetake}
          className="flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:brightness-90 active:scale-95"
          style={{
            background: 'linear-gradient(145deg, #8B1A1A, #6B1414)',
            fontFamily: "'Gravitas One', cursive",
            fontSize: 'clamp(12px, 3.5vw, 15px)',
            letterSpacing: '0.06em',
            boxShadow: '0 4px 16px rgba(139,26,26,0.45)',
          }}
        >
          Retake
        </button>
      </div>
    </WoodFrame>
  )
}