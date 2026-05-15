'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/layout'
import { api } from '@/lib/api'
import AuthBackground from '@/components/AuthBackground'
import PasswordField from '@/components/PasswordField'

export default function SignupPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', organizationName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const update = (field) => (e) => {
    const val = e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
    if (field === 'password') {
      let s = 0
      if (val.length >= 6) s++
      if (val.length >= 10) s++
      if (/[A-Z]/.test(val)) s++
      if (/[0-9]/.test(val)) s++
      if (/[^A-Za-z0-9]/.test(val)) s++
      setPasswordStrength(s)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      const data = await api.auth.signup({
        email: form.email, password: form.password, organizationName: form.organizationName,
      })
      login(data.token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const strengthMeta = (lvl) => {
    const bars = [
      { color: 'bg-red-500', width: 'w-1/5', label: 'Weak' },
      { color: 'bg-orange-500', width: 'w-2/5', label: 'Fair' },
      { color: 'bg-yellow-500', width: 'w-3/5', label: 'Good' },
      { color: 'bg-lime-500', width: 'w-4/5', label: 'Strong' },
      { color: 'bg-emerald-500', width: 'w-full', label: 'Very strong' },
    ]
    return bars[Math.min(lvl, 4)] || { color: 'bg-gray-600', width: 'w-0', label: '' }
  }

  return (
    <div className="min-h-screen bg-[#07080b] flex items-center justify-center p-4 relative overflow-hidden">
      <AuthBackground />

      <div className={`w-full max-w-md transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative bg-[#0e0f14]/90 backdrop-blur-xl rounded-2xl border border-white/[0.06] shadow-2xl p-8 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className={`text-center mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Start managing your inventory in minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in">
                {error}
              </div>
            )}

            {[
              { field: 'organizationName', label: 'Organization name', placeholder: 'My Store', delay: 150, autoComplete: 'off' },
              { field: 'email', label: 'Email address', placeholder: 'you@example.com', delay: 200, autoComplete: 'email', type: 'email' },
            ].map((f) => (
              <div key={f.field} className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${f.delay}ms` }}>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">{f.label}</label>
                <input type={f.type || 'text'} required value={form[f.field]} onChange={update(f.field)}
                  className="w-full px-3.5 py-2.5 bg-[#121318] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder={f.placeholder} autoComplete={f.autoComplete} />
              </div>
            ))}

            <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '250ms' }}>
              <PasswordField value={form.password} onChange={update('password')}
                placeholder="Min. 6 characters" autoComplete="new-password" label="Password" />
              {form.password && (
                <div className="mt-2 animate-fade-in">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${strengthMeta(passwordStrength - 1).color} transition-all duration-300 ${passwordStrength > 0 ? strengthMeta(passwordStrength - 1).width : 'w-0'}`} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {passwordStrength === 0 ? 'Weak' : passwordStrength <= 2 ? 'Fair' : passwordStrength <= 3 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
              <PasswordField value={form.confirmPassword} onChange={update('confirmPassword')}
                placeholder="Repeat your password" autoComplete="new-password" label="Confirm password" />
            </div>

            <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '350ms' }}>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create account'}
              </button>
            </div>

            <div className={`text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
