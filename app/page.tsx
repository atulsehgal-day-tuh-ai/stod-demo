'use client'

import { useState, useEffect } from 'react'
import LandingPage from '@/components/LandingPage'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('stod_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setShowLogin(false)
    }
    setLoading(false)
  }, [])

  const handleGetStarted = () => {
    setShowLogin(true)
  }

  const handleLogin = (userData: any) => {
    setUser(userData)
    localStorage.setItem('stod_user', JSON.stringify(userData))
    setShowLogin(false)
  }

  const handleLogout = () => {
    setUser(null)
    setShowLogin(true) // Show login screen after logout
    localStorage.removeItem('stod_user')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : showLogin ? (
        <LoginForm onLogin={handleLogin} onGoHome={() => setShowLogin(false)} />
      ) : (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
    </main>
  )
}

