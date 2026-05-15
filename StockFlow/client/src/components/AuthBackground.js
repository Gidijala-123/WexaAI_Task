function Cube({ className, size = 60, delay = 0, left, top }) {
  const s = size / 2
  return (
    <div className={`absolute animate-float ${className}`} style={{ left, top, animationDelay: `${delay}s` }}>
      <div className="relative" style={{ width: size, height: size, transform: 'rotate3d(1, 0.5, 0, 35deg) rotateZ(-15deg)', transformStyle: 'preserve-3d' }}>
        {['translateZ', 'rotateY(90deg) translateZ', 'rotateX(90deg) translateZ'].map((t) => (
          <div key={t} className="absolute inset-0 border border-indigo-500/20 bg-indigo-500/[0.03]" style={{ transform: `${t}(${s}px)` }} />
        ))}
        {['translateZ', 'rotateY(90deg) translateZ', 'rotateX(90deg) translateZ'].map((t) => (
          <div key={t + 'neg'} className="absolute inset-0 border border-indigo-500/20 bg-indigo-500/[0.03]" style={{ transform: `${t}(-${s}px)` }} />
        ))}
      </div>
    </div>
  )
}

export default function AuthBackground() {
  const cubes = [
    { left: '8%', top: '12%', size: 40, delay: 0, rev: false },
    { left: '88%', top: '18%', size: 55, delay: 1.5, rev: true },
    { left: '78%', top: '72%', size: 35, delay: 0.8, rev: false },
    { left: '15%', top: '78%', size: 50, delay: 2.2, rev: true },
    { left: '50%', top: '8%', size: 30, delay: 3, rev: false },
    { left: '92%', top: '55%', size: 25, delay: 1.2, rev: true },
    { left: '5%', top: '48%', size: 45, delay: 2.8, rev: false },
  ]
  const glows = [
    { left: '60%', top: '40%', size: 180, delay: 0 },
    { left: '25%', top: '65%', size: 250, delay: 2 },
    { left: '70%', top: '20%', size: 140, delay: 4 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.08),transparent_70%)]" />
      {cubes.map((c, i) => (
        <Cube key={i} left={c.left} top={c.top} size={c.size} delay={c.delay}
          className={`${c.rev ? 'animate-float-reverse' : ''} hidden sm:block`} />
      ))}
      {glows.map((c, i) => (
        <div key={i} className="absolute rounded-full animate-pulse-glow hidden sm:block" style={{
          left: c.left, top: c.top, width: c.size, height: c.size,
          transform: 'translate(-50%,-50%)', animationDelay: `${c.delay}s`,
          background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)',
        }} />
      ))}
    </div>
  )
}
