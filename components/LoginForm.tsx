'use client'

import { useState } from 'react'
import { FiUser, FiLock, FiLogIn, FiStar, FiHome, FiChevronDown, FiChevronUp } from 'react-icons/fi'

interface LoginFormProps {
  onLogin: (user: any) => void
  onGoHome?: () => void
  onGoSignUp?: () => void
}

export default function LoginForm({ onLogin, onGoHome, onGoSignUp }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showRoles, setShowRoles] = useState(false)

  const demoUsers = [
    { 
      id: 1, 
      username: 'admin', 
      password: 'admin123', 
      role: 'Admin', 
      name: 'System Admin',
      email: 'admin@stod.com',
      credits: 999999,
      walletStatus: 'Infinite',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    { 
      id: 2, 
      username: 'moderator', 
      password: 'moderator123', 
      role: 'Moderator', 
      name: 'Sarah Moderator',
      email: 'curator@stod.com',
      credits: 5000,
      walletStatus: 'Stakeholder',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      username: 'subscriber1',
      password: 'subscriber123',
      role: 'Subscriber',
      name: 'Sam Subscriber 1',
      email: 'subscriber1@stod.com',
      credits: 2500,
      walletStatus: 'Rechargeable',
      status: 'Active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 5,
      username: 'subscriber2',
      password: 'subscriber123',
      role: 'Subscriber',
      name: 'Sid Subscriber 2',
      email: 'subscriber2@stod.com',
      credits: 2500,
      walletStatus: 'Rechargeable',
      status: 'Active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 6,
      username: 'subscriber3',
      password: 'subscriber123',
      role: 'Subscriber',
      name: 'Sana Subscriber 3',
      email: 'subscriber3@stod.com',
      credits: 2500,
      walletStatus: 'Rechargeable',
      status: 'Active',
      createdAt: new Date().toISOString(),
    },
    { 
      id: 4, 
      username: 'non',
      password: 'non123',
      role: 'Non-subscriber',
      name: 'Nina Non-subscriber',
      email: 'nonsubscriber@stod.com',
      credits: 50,
      walletStatus: 'Starter',
      status: 'Active',
      createdAt: new Date().toISOString(),
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const user = demoUsers.find(
      (u) => u.username === username && u.password === password
    )

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      onLogin(userWithoutPassword)
    } else {
      setError('Invalid username or password')
    }
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Admin': 'from-purple-500 to-purple-700',
      'Moderator': 'from-blue-500 to-blue-700',
      'Subscriber': 'from-cyan-500 to-cyan-700',
      'Non-subscriber': 'from-gray-400 to-gray-600',
    }
    return colors[role] || 'from-gray-400 to-gray-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-2xl shadow-xl p-8 relative border border-white/60 bg-white/85 backdrop-blur-md">
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="absolute top-4 left-4 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <FiHome className="text-lg" />
            <span className="text-sm font-medium">Home</span>
          </button>
        )}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg transform hover:scale-110 transition-transform">
            <FiStar className="text-white text-2xl" />
          </div>
          <h1 className="text-gray-900 mb-2">
            <span className="block text-3xl sm:text-4xl font-bold italic whitespace-nowrap">
              Same Thing Only Different
            </span>
            <span className="block text-2xl font-bold text-gray-600">
              Community
            </span>
          </h1>
          <p className="text-xs text-gray-600">
            Principles • Pattern Recognition • Real-World Application
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400 shadow-sm"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400 shadow-sm"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <FiLogIn />
            Sign In
          </button>
        </form>

        {onGoSignUp && (
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={onGoSignUp}
              className="text-primary-700 hover:text-primary-900 font-semibold underline underline-offset-4"
            >
              New here? Create an account
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowRoles((v) => !v)}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 text-center"
            aria-expanded={showRoles}
            aria-controls="demo-roles"
          >
            <span>🎭 Try Different Roles</span>
            {showRoles ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          <div
            id="demo-roles"
            className={`transition-all duration-300 overflow-hidden ${showRoles ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              {demoUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-2 rounded-lg bg-gradient-to-r ${getRoleColor(user.role)} text-white text-center font-medium cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => {
                    setUsername(user.username)
                    setPassword(user.password)
                  }}
                >
                  {user.role}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s;
        }
      `}</style>
    </div>
  )
}

