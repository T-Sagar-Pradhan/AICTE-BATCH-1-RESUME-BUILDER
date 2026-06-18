import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let time = 0

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 0.8,
      speedX: (Math.random() - 0.5) * 0.0004,
      speedY: (Math.random() - 0.5) * 0.0003,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      hue: Math.random() * 60 + 220, // blue-purple range
    }))

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const onMouse = (e) => {
      mouse.current.x = e.clientX / window.innerWidth
      mouse.current.y = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMouse)

    const draw = () => {
      time += 0.004
      const { width: W, height: H } = canvas
      const mx = mouse.current.x
      const my = mouse.current.y

      ctx.clearRect(0, 0, W, H)

      // ═══ AURORA WAVES ═══
      // Wave 1 - Big purple-blue
      ctx.beginPath()
      ctx.moveTo(0, H * 0.3)
      for (let x = 0; x <= W; x += 3) {
        const y = H * 0.28 +
          Math.sin(x * 0.0015 + time * 1.5) * 60 +
          Math.sin(x * 0.004 + time * 0.7) * 30 +
          Math.cos(x * 0.002 + time * 1.2) * 20 +
          (mx - 0.5) * 40
        ctx.lineTo(x, y)
      }
      ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.closePath()
      const g1 = ctx.createLinearGradient(0, 0, W, H * 0.4)
      g1.addColorStop(0, 'rgba(99, 102, 241, 0.08)')
      g1.addColorStop(0.4, 'rgba(139, 92, 246, 0.12)')
      g1.addColorStop(0.7, 'rgba(168, 85, 247, 0.06)')
      g1.addColorStop(1, 'rgba(59, 130, 246, 0.03)')
      ctx.fillStyle = g1
      ctx.fill()

      // Wave 2 - Cyan-indigo from bottom
      ctx.beginPath()
      ctx.moveTo(0, H * 0.75)
      for (let x = 0; x <= W; x += 3) {
        const y = H * 0.72 +
          Math.sin(x * 0.002 + time * 1.2 + 1) * 45 +
          Math.cos(x * 0.003 + time * 0.9) * 25 +
          (my - 0.5) * 30
        ctx.lineTo(x, y)
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath()
      const g2 = ctx.createLinearGradient(0, H * 0.5, W, H)
      g2.addColorStop(0, 'rgba(56, 189, 248, 0.04)')
      g2.addColorStop(0.3, 'rgba(99, 102, 241, 0.1)')
      g2.addColorStop(0.6, 'rgba(139, 92, 246, 0.08)')
      g2.addColorStop(1, 'rgba(79, 70, 229, 0.04)')
      ctx.fillStyle = g2
      ctx.fill()

      // Wave 3 - Subtle middle accent
      ctx.beginPath()
      ctx.moveTo(0, H * 0.5)
      for (let x = 0; x <= W; x += 4) {
        const y = H * 0.5 +
          Math.sin(x * 0.001 + time * 2) * 50 +
          Math.cos(x * 0.003 + time * 1.4) * 20
        ctx.lineTo(x, y)
      }
      ctx.lineTo(W, H * 0.5 + 80); ctx.lineTo(0, H * 0.5 + 80); ctx.closePath()
      const g3 = ctx.createLinearGradient(0, H * 0.4, W, H * 0.6)
      g3.addColorStop(0, 'rgba(192, 132, 252, 0.04)')
      g3.addColorStop(0.5, 'rgba(129, 140, 248, 0.06)')
      g3.addColorStop(1, 'rgba(96, 165, 250, 0.03)')
      ctx.fillStyle = g3
      ctx.fill()

      // ═══ LARGE GRADIENT SPHERES ═══
      const spheres = [
        { x: 0.2 + Math.sin(time * 0.5) * 0.05, y: 0.3 + Math.cos(time * 0.4) * 0.05, r: 250, color: '139, 92, 246', opacity: 0.06 },
        { x: 0.8 + Math.cos(time * 0.3) * 0.04, y: 0.6 + Math.sin(time * 0.6) * 0.04, r: 200, color: '59, 130, 246', opacity: 0.05 },
        { x: 0.5 + Math.sin(time * 0.7) * 0.03, y: 0.8 + Math.cos(time * 0.5) * 0.03, r: 180, color: '99, 102, 241', opacity: 0.04 },
      ]
      spheres.forEach(({ x, y, r, color, opacity }) => {
        const sx = x * W + (mx - 0.5) * 50
        const sy = y * H + (my - 0.5) * 30
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r)
        grad.addColorStop(0, `rgba(${color}, ${opacity})`)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.fillRect(sx - r, sy - r, r * 2, r * 2)
      })

      // ═══ SPOTLIGHT ═══
      const spotX = mx * W
      const spotY = my * H
      const spotG = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 350)
      spotG.addColorStop(0, 'rgba(139, 92, 246, 0.06)')
      spotG.addColorStop(0.4, 'rgba(99, 102, 241, 0.03)')
      spotG.addColorStop(1, 'transparent')
      ctx.fillStyle = spotG
      ctx.fillRect(0, 0, W, H)

      // ═══ PARTICLES ═══
      particles.forEach((p) => {
        p.x += p.speedX + (mx - 0.5) * 0.0003
        p.y += p.speedY + (my - 0.5) * 0.0002
        p.pulse += 0.015

        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0
        if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0

        const px = p.x * W
        const py = p.y * H
        const op = p.opacity * (0.4 + 0.6 * Math.sin(p.pulse))
        const sz = p.size * (0.7 + 0.3 * Math.sin(p.pulse * 0.7))

        // Outer glow
        const glowG = ctx.createRadialGradient(px, py, 0, px, py, sz * 5)
        glowG.addColorStop(0, `hsla(${p.hue}, 80%, 75%, ${op * 0.25})`)
        glowG.addColorStop(1, 'transparent')
        ctx.fillStyle = glowG
        ctx.beginPath()
        ctx.arc(px, py, sz * 5, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(px, py, sz, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 80%, 80%, ${op})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMouse) }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}
