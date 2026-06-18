import { useRef, useState } from 'react'

/**
 * Premium 3D tilt card with mouse-following light reflection.
 */
export default function TiltCard({ children, className = '', glowColor = 'rgba(99, 102, 241, 0.15)' }) {
  const cardRef = useRef(null)
  const [style, setStyle] = useState({})
  const [glowStyle, setGlowStyle] = useState({})

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -4
    const rotateY = ((x - centerX) / centerX) * 4

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`,
      transition: 'transform 0.1s ease-out',
    })

    setGlowStyle({
      background: `radial-gradient(circle at ${x}px ${y}px, ${glowColor}, transparent 60%)`,
      opacity: 1,
    })
  }

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
      transition: 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
    })
    setGlowStyle({ opacity: 0 })
  }

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 rounded-[inherit]"
        style={glowStyle}
      />
      {/* Shine sweep on hover */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-0 hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
      {/* Content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  )
}
