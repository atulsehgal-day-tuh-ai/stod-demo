'use client'

import { useState, useEffect } from 'react'
import LandingPage from '@/components/LandingPage'
import LoginForm from '@/components/LoginForm'
import SignUpForm from '@/components/SignUpForm'
import HowItWorks from '@/components/HowItWorks'
import Dashboard from '@/components/Dashboard'
import { normalizeRole } from '@/lib/roles'
import { ensureSeedStodUsers } from '@/lib/demoUsers'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Seed demo user directory for collaboration/invites (safe: won't overwrite if already on new role model)
    ensureSeedStodUsers()

    // Check if user is logged in
    const storedUser = localStorage.getItem('stod_user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      const next = parsed && typeof parsed === 'object' ? { ...parsed, role: normalizeRole((parsed as any).role) } : parsed
      setUser(next)
      // Persist normalization so the rest of the app doesn’t see legacy roles
      localStorage.setItem('stod_user', JSON.stringify(next))
      setShowLogin(false)
    }
    setLoading(false)
  }, [])

  const handleGetStarted = () => {
    setShowLogin(true)
    setShowSignUp(false)
    setShowHowItWorks(false)
  }

  const handleSignUp = () => {
    setShowSignUp(true)
    setShowLogin(false)
    setShowHowItWorks(false)
  }

  const handleHowItWorks = () => {
    setShowHowItWorks(true)
    setShowLogin(false)
    setShowSignUp(false)
  }

  const handleLogin = (userData: any) => {
    setUser(userData)
    localStorage.setItem('stod_user', JSON.stringify(userData))
    setShowLogin(false)
  }

  const handleLogout = () => {
    setUser(null)
    setShowLogin(true) // Show login screen after logout
    setShowSignUp(false)
    setShowHowItWorks(false)
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
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onUpdateUser={(nextUser) => {
            setUser(nextUser)
            localStorage.setItem('stod_user', JSON.stringify(nextUser))
          }}
        />
      ) : showLogin ? (
        <LoginForm
          onLogin={handleLogin}
          onGoHome={() => {
            setShowLogin(false)
            setShowSignUp(false)
            setShowHowItWorks(false)
          }}
          onGoSignUp={handleSignUp}
        />
      ) : showSignUp ? (
        <SignUpForm
          onGoHome={() => {
            setShowLogin(false)
            setShowSignUp(false)
            setShowHowItWorks(false)
          }}
          onGoSignIn={handleGetStarted}
        />
      ) : showHowItWorks ? (
        <HowItWorks
          onGoHome={() => {
            setShowLogin(false)
            setShowSignUp(false)
            setShowHowItWorks(false)
          }}
          onSignIn={handleGetStarted}
          onSignUp={handleSignUp}
        />
      ) : (
        <LandingPage
          onGetStarted={handleGetStarted}
          onSignUp={handleSignUp}
          onHowItWorks={handleHowItWorks}
        />
      )}
    </main>
  )
}

