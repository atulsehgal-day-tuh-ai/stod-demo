'use client'

import { useState } from 'react'
import { FiUser, FiLock, FiLogIn, FiStar, FiHome } from 'react-icons/fi'

interface LoginFormProps {
  onLogin: (user: any) => void
  onGoHome?: () => void
}

export default function LoginForm({ onLogin, onGoHome }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

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
      username: 'curator', 
      password: 'curator123', 
      role: 'Curator', 
      name: 'Sarah Curator',
      email: 'curator@stod.com',
      credits: 5000,
      walletStatus: 'Stakeholder',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    { 
      id: 3, 
      username: 'architect', 
      password: 'architect123', 
      role: 'Architect', 
      name: 'Alex Architect',
      email: 'architect@stod.com',
      credits: 2500,
      walletStatus: 'Accumulator',
      status: 'Active',
      successfulSubmissions: 8,
      createdAt: new Date().toISOString()
    },
    { 
      id: 4, 
      username: 'practitioner', 
      password: 'practitioner123', 
      role: 'Practitioner', 
      name: 'Jordan Practitioner',
      email: 'practitioner@stod.com',
      credits: 1000,
      walletStatus: 'Monthly Allowance',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    { 
      id: 5, 
      username: 'learner', 
      password: 'learner123', 
      role: 'Learner', 
      name: 'Morgan Learner',
      email: 'learner@stod.com',
      credits: 100,
      walletStatus: 'Rechargeable',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    { 
      id: 6, 
      username: 'seeker', 
      password: 'seeker123', 
      role: 'Seeker', 
      name: 'Taylor Seeker',
      email: 'seeker@stod.com',
      phone: '123-456-7890',
      credits: 50,
      walletStatus: 'Starter',
      status: 'Active',
      createdAt: new Date().toISOString()
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
      'Curator': 'from-blue-500 to-blue-700',
      'Architect': 'from-green-500 to-green-700',
      'Practitioner': 'from-orange-500 to-orange-700',
      'Learner': 'from-cyan-500 to-cyan-700',
      'Seeker': 'from-gray-400 to-gray-600',
    }
    return colors[role] || 'from-gray-400 to-gray-600'
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/tree.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Subtle dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/15"></div>

      <div 
        className="max-w-md w-full rounded-2xl shadow-2xl p-8 relative z-10 border border-white/40"
        style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)',
        }}
      >
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="absolute top-4 left-4 flex items-center gap-2 text-white/90 hover:text-white transition-colors drop-shadow-md"
            style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)' }}
          >
            <FiHome className="text-lg" />
            <span className="text-sm font-medium">Home</span>
          </button>
        )}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg transform hover:scale-110 transition-transform">
            <FiStar className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)' }}>
            STOD Repository
          </h1>
          <p className="text-white font-medium italic text-lg mb-1 drop-shadow-md" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)' }}>
            Same Thing Only Different
          </p>
          <p className="text-xs text-white/90 drop-shadow-md" style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)' }}>
            Universal Truths • Pattern Recognition • Real-World Application
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2 drop-shadow-md" style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)' }}>
              Username
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/90 z-10 drop-shadow-sm" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/40 backdrop-blur-sm border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/70 focus:bg-white/60 transition-all text-white placeholder:text-white/60"
                placeholder="Enter username"
                required
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2 drop-shadow-md" style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)' }}>
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/90 z-10 drop-shadow-sm" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/40 backdrop-blur-sm border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/70 focus:bg-white/60 transition-all text-white placeholder:text-white/60"
                placeholder="Enter password"
                required
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/40 backdrop-blur-sm border-2 border-red-400/60 text-white px-4 py-3 rounded-xl animate-shake drop-shadow-md" style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-600/90 to-primary-700/90 hover:from-primary-700 hover:to-primary-800 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-white/30"
            style={{
              boxShadow: '0 4px 15px 0 rgba(79, 70, 229, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
            }}
          >
            <FiLogIn />
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/30">
          <p className="text-sm font-semibold text-white text-center mb-4 drop-shadow-md" style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)' }}>
            🎭 Try Different Roles
          </p>
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

