'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/layout'
import { api } from '@/lib/api'

function Cube({ className, size = 60, delay = 0, left, top }) {
  const s = size / 2
  return (
    <div className={`absolute animate-float ${className}`} style={{ left, top, animationDelay: `${delay}s` }}>
      <div className="relative" style={{ width: size, height: size, transform: 'rotate3d(1, 0.5, 0, 35deg) rotateZ(-15deg)', transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 border border-indigo-500/20 bg-indigo-500/[0.03]" style={{ transform: `translateZ(${s}px)` }} />
        <div className="absolute inset-0 border border-indigo-500/20 bg-indigo-500/[0.03]" style={{ transform: `rotateY(90deg) translateZ(${s}px)` }} />
        <div className="absolute inset-0 border border-indigo-500/20 bg-indigo-500/[0.03]" style={{ transform: `rotateX(90deg) translateZ(${s}px)` }} />
        <div className="absolute inset-0 border border-indigo-500/20 bg-indigo-500/[0.03]" style={{ transform: `translateZ(-${s}px)` }} />
        <div className="absolute inset-0 border border-indigo-500/20 bg-indigo-500/[0.03]" style={{ transform: `rotateY(90deg) translateZ(-${s}px)` }} />
        <div className="absolute inset-0 border border-indigo-500/20 bg-indigo-500/[0.03]" style={{ transform: `rotateX(90deg) translateZ(-${s}px)` }} />
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.auth.login({ email, password })
      login(data.token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cubes = [
    { left: '8%', top: '12%', size: 40, delay: 0, rev: false },
    { left: '88%', top: '18%', size: 55, delay: 1.5, rev: true },
    { left: '78%', top: '72%', size: 35, delay: 0.8, rev: false },
    { left: '15%', top: '78%', size: 50, delay: 2.2, rev: true },
    { left: '50%', top: '8%', size: 30, delay: 3, rev: false },
    { left: '92%', top: '55%', size: 25, delay: 1.2, rev: true },
    { left: '3%', top: '48%', size: 45, delay: 2.8, rev: false },
  ]

  const glows = [
    { left: '60%', top: '40%', size: 180, delay: 0 },
    { left: '30%', top: '60%', size: 250, delay: 1.5 },
    { left: '70%', top: '20%', size: 120, delay: 3 },
  ]

  return (
    <div className="min-h-screen bg-[#07080b] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.08),transparent_70%)]" />

        {cubes.map((c, i) => (
          <Cube key={i} left={c.left} top={c.top} size={c.size} delay={c.delay}
            className={c.rev ? 'animate-float-reverse' : ''} />
        ))}

        {glows.map((c, i) => (
          <div key={i} className="absolute rounded-full animate-pulse-glow" style={{
            left: c.left, top: c.top, width: c.size, height: c.size,
            transform: 'translate(-50%,-50%)', animationDelay: `${c.delay}s`,
            background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)',
          }} />
        ))}
      </div>

      <div className={`w-full max-w-md transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative bg-[#0e0f14]/90 backdrop-blur-xl rounded-2xl border border-white/[0.06] shadow-2xl p-8 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className={`text-center mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">StockFlow</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in">
                {error}
              </div>
            )}

            <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#121318] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
                placeholder="you@example.com" autoComplete="email" />
            </div>

            <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#121318] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
                placeholder="Enter your password" autoComplete="current-password" />
            </div>

            <div className={`transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </div>

            <div className={`text-center transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
