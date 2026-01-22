'use client'

import { useMemo, useState } from 'react'
import {
  FiArrowRight,
  FiHome,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
  FiUsers,
} from 'react-icons/fi'

interface SignUpFormProps {
  onGoHome?: () => void
  onGoSignIn?: () => void
}

type HearAbout =
  | 'social'
  | 'search'
  | 'podcast'
  | 'event'
  | 'friend'
  | 'other'

export default function SignUpForm({ onGoHome, onGoSignIn }: SignUpFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [hearAbout, setHearAbout] = useState<HearAbout>('social')
  const [friendName, setFriendName] = useState('')
  const [notes, setNotes] = useState('')

  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const requiresFriendName = hearAbout === 'friend'

  const canSubmit = useMemo(() => {
    if (!fullName.trim()) return false
    if (!email.trim()) return false
    if (!phone.trim()) return false
    if (!password) return false
    if (!confirmPassword) return false
    if (password !== confirmPassword) return false
    if (requiresFriendName && !friendName.trim()) return false
    return true
  }, [confirmPassword, email, friendName, fullName, password, phone, requiresFriendName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (requiresFriendName && !friendName.trim()) {
      setError("Please enter your friend's name")
      return
    }

    // Dummy flow: we don't create users here.
    setSuccess('Thanks! Your sign up request was captured (demo mode). You can now sign in using the demo roles.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-purple-50 flex items-center justify-center px-4 py-10">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg">
            <FiUsers className="text-white text-2xl" />
          </div>
          <h1 className="text-gray-900 mb-2">
            <span className="block text-3xl sm:text-4xl font-bold italic whitespace-nowrap">
              Same Thing Only Different
            </span>
            <span className="block text-2xl font-bold text-gray-600">Community</span>
          </h1>
          <p className="text-xs text-gray-600">
            Create your account (demo screen)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400 shadow-sm"
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400 shadow-sm"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400 shadow-sm"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400 shadow-sm"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              How did you hear about us?
            </label>
            <select
              value={hearAbout}
              onChange={(e) => setHearAbout(e.target.value as HearAbout)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 shadow-sm"
            >
              <option className="text-black" value="social">
                Social media
              </option>
              <option className="text-black" value="search">
                Search (Google, etc.)
              </option>
              <option className="text-black" value="podcast">
                Podcast / Video
              </option>
              <option className="text-black" value="event">
                Event / Meetup
              </option>
              <option className="text-black" value="friend">
                Referred by a friend
              </option>
              <option className="text-black" value="other">
                Other
              </option>
            </select>
          </div>

          {requiresFriendName && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Friend&apos;s name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400 shadow-sm"
                  placeholder="Who referred you?"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Anything else? (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400 min-h-[90px] shadow-sm"
              placeholder="Tell us what you’re hoping to get out of the community…"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg border ${
              canSubmit
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 border-white/40 hover:border-white/70 hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gray-300 border-gray-300 opacity-60 cursor-not-allowed'
            }`}
          >
            <FiArrowRight />
            Create account
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onGoSignIn}
              className="text-primary-700 hover:text-primary-900 font-semibold underline underline-offset-4"
            >
              Already have an account? Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

