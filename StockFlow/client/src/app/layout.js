'use client'
import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import './globals.css'

const AuthContext = createContext(null)
const ToastContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function useToast() {
  return useContext(ToastContext)
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-slide-in px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center justify-between ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-3 text-current opacity-50 hover:opacity-100">&times;</button>
        </div>
      ))}
    </div>
  )
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])
  const router = useRouter()
  const pathname = usePathname()

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Invalid token')
          return res.json()
        })
        .then((data) => {
          setUser(data.user)
          setLoading(false)
          if (pathname === '/login' || pathname === '/signup') {
            router.push('/dashboard')
          }
        })
        .catch(() => {
          localStorage.removeItem('token')
          setLoading(false)
          if (pathname !== '/login' && pathname !== '/signup' && pathname !== '/') {
            router.push('/login')
          }
        })
    } else {
      setLoading(false)
      if (pathname !== '/login' && pathname !== '/signup' && pathname !== '/') {
        router.push('/login')
      }
    }
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    setUser(userData)
    addToast('Welcome to StockFlow!', 'success')
    router.push('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      <ToastContext.Provider value={{ addToast }}>
        {children}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </ToastContext.Provider>
    </AuthContext.Provider>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>StockFlow - Inventory Management</title>
        <meta name="description" content="SaaS Inventory Management System" />
      </head>
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
