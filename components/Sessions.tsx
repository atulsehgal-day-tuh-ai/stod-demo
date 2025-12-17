'use client'

import { useState, useEffect } from 'react'
import { FiCalendar, FiClock, FiUsers, FiDollarSign, FiCheckCircle, FiXCircle, FiUser, FiBookOpen, FiZap } from 'react-icons/fi'

interface SessionsProps {
  user: any
  onCreditUpdate?: (newCredits: number) => void
}

export default function Sessions({ user, onCreditUpdate }: SessionsProps) {
  const [sessions, setSessions] = useState<any[]>([])
  const [myBookings, setMyBookings] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Role-based pricing (STOD credits required)
  const getSessionPrice = (basePrice: number) => {
    if (!user || !user.role) return basePrice
    if (user.role === 'Curator' || user.role === 'Admin') {
      return 0 // Free for Curators and Admins
    }
    if (user.role === 'Architect') {
      return Math.floor(basePrice * 0.3) // 30% of base price
    }
    if (user.role === 'Practitioner') {
      return Math.floor(basePrice * 0.5) // 50% of base price
    }
    if (user.role === 'Learner') {
      return Math.floor(basePrice * 0.7) // 70% of base price
    }
    if (user.role === 'Seeker') {
      return basePrice // 100% - pays the most
    }
    return basePrice
  }

  useEffect(() => {
    if (!user) return
    
    // Create sample sessions function
    const createSampleSessions = () => {
      const now = new Date()
      return [
        {
          id: 1,
          title: 'Same Thing Only Different - Masterclass',
          topic: 'Deep dive into pattern recognition and seeing the familiar in the unfamiliar',
          instructor: 'Gary D. Kennedy',
          date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          duration: 90, // minutes
          totalSeats: 20,
          basePrice: 500, // STOD credits
          bookedSeats: [],
          status: 'Open',
        },
        {
          id: 2,
          title: 'Pay Attention - The Art of Observation',
          topic: 'Practical exercises for developing observation skills and noticing what others miss',
          instructor: 'Gary D. Kennedy',
          date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          duration: 60,
          totalSeats: 15,
          basePrice: 400,
          bookedSeats: [],
          status: 'Open',
        },
        {
          id: 3,
          title: 'Context Matters - Understanding the Why',
          topic: 'How to ask the right questions and understand the full picture before acting',
          instructor: 'Gary D. Kennedy',
          date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
          duration: 75,
          totalSeats: 25,
          basePrice: 450,
          bookedSeats: [],
          status: 'Open',
        },
        {
          id: 4,
          title: 'Applying Principles to Real Life',
          topic: 'Hard questions that matter and connecting principles to daily practice',
          instructor: 'Gary D. Kennedy',
          date: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(), // 28 days from now
          duration: 90,
          totalSeats: 30,
          basePrice: 600,
          bookedSeats: [],
          status: 'Open',
        },
        {
          id: 5,
          title: 'Dissonance Matrix Workshop',
          topic: 'Interactive workshop on identifying tensions and finding balance points',
          instructor: 'Gary D. Kennedy',
          date: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days from now
          duration: 120,
          totalSeats: 18,
          basePrice: 700,
          bookedSeats: [],
          status: 'Open',
        },
        {
          id: 6,
          title: 'Q&A Session - Open Forum',
          topic: 'Ask Gary anything about principles, patterns, and practical application',
          instructor: 'Gary D. Kennedy',
          date: new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000).toISOString(), // 42 days from now
          duration: 60,
          totalSeats: 40,
          basePrice: 300,
          bookedSeats: [],
          status: 'Open',
        },
      ]
    }
    
    // Load sessions
    const storedSessions = localStorage.getItem('stod_sessions')
    if (storedSessions) {
      try {
        setSessions(JSON.parse(storedSessions))
      } catch (e) {
        console.error('Error parsing sessions:', e)
        // Create sample sessions if parsing fails
        const sampleSessions = createSampleSessions()
        setSessions(sampleSessions)
        localStorage.setItem('stod_sessions', JSON.stringify(sampleSessions))
      }
    } else {
      // Create sample sessions if none exist
      const sampleSessions = createSampleSessions()
      setSessions(sampleSessions)
      localStorage.setItem('stod_sessions', JSON.stringify(sampleSessions))
    }

    // Load my bookings
    const storedBookings = localStorage.getItem('stod_bookings')
    if (storedBookings && user.id) {
      try {
        const allBookings = JSON.parse(storedBookings)
        setMyBookings(allBookings.filter((b: any) => b.userId === user.id))
      } catch (e) {
        console.error('Error parsing bookings:', e)
      }
    }
  }, [user])

  const handleBookSession = (session: any) => {
    if (!user || !user.id) {
      alert('Please log in to book a session.')
      return
    }
    
    const price = getSessionPrice(session.basePrice)
    const availableSeats = session.totalSeats - (session.bookedSeats?.length || 0)

    // Check if already booked
    if (session.bookedSeats?.some((seat: any) => seat.userId === user.id)) {
      alert('You have already booked this session!')
      return
    }

    // Check if session is full
    if (availableSeats <= 0) {
      alert('This session is full!')
      return
    }

    // Check if user has enough credits (unless free)
    if (price > 0 && ((user.credits || 0) < price)) {
      alert(`Insufficient credits! You need ${price} STOD credits but only have ${user.credits || 0}.`)
      return
    }

    // Confirm booking
    if (!confirm(`Book this session for ${price === 0 ? 'FREE' : `${price} STOD credits`}?`)) {
      return
    }

    // Update session with booking
    const updatedSessions = sessions.map(s => {
      if (s.id === session.id) {
        const newBooking = {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          bookedAt: new Date().toISOString(),
          pricePaid: price,
        }
        return {
          ...s,
          bookedSeats: [...s.bookedSeats, newBooking],
        }
      }
      return s
    })

    setSessions(updatedSessions)
    localStorage.setItem('stod_sessions', JSON.stringify(updatedSessions))

    // Create booking record
    const booking = {
      id: Date.now(),
      sessionId: session.id,
      sessionTitle: session.title,
      userId: user.id,
      userName: user.name,
      date: session.date,
      pricePaid: price,
      bookedAt: new Date().toISOString(),
    }

    const storedBookings = localStorage.getItem('stod_bookings')
    const allBookings = storedBookings ? JSON.parse(storedBookings) : []
    allBookings.push(booking)
    localStorage.setItem('stod_bookings', JSON.stringify(allBookings))
    setMyBookings([...myBookings, booking])

    // Deduct credits (unless free)
    if (price > 0) {
      const newCredits = (user.credits || 0) - price
      const updatedUser = { ...user, credits: newCredits }
      localStorage.setItem('stod_user', JSON.stringify(updatedUser))
      if (onCreditUpdate) {
        onCreditUpdate(newCredits)
      }
    }

    alert(`Successfully booked! ${price > 0 ? `${price} STOD credits deducted.` : 'Free for your role!'}`)
    setSelectedSession(null)
  }

  const handleCancelBooking = (booking: any) => {
    if (!user || !user.id) {
      alert('Please log in to cancel a booking.')
      return
    }
    
    if (!confirm('Cancel this booking? Credits will not be refunded.')) {
      return
    }

    // Remove from session
    const updatedSessions = sessions.map(s => {
      if (s.id === booking.sessionId) {
        return {
          ...s,
          bookedSeats: (s.bookedSeats || []).filter((seat: any) => seat.userId !== user.id),
        }
      }
      return s
    })

    setSessions(updatedSessions)
    localStorage.setItem('stod_sessions', JSON.stringify(updatedSessions))

    // Remove booking
    const storedBookings = localStorage.getItem('stod_bookings')
    const allBookings = storedBookings ? JSON.parse(storedBookings) : []
    const updatedBookings = allBookings.filter((b: any) => b.id !== booking.id)
    localStorage.setItem('stod_bookings', JSON.stringify(updatedBookings))
    setMyBookings(myBookings.filter(b => b.id !== booking.id))

    alert('Booking cancelled!')
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(s => {
      const sessionDate = new Date(s.date)
      return sessionDate.toDateString() === date.toDateString()
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRoleDiscount = () => {
    if (!user || !user.role) return 'Loading...'
    if (user.role === 'Curator' || user.role === 'Admin') return 'FREE'
    if (user.role === 'Architect') return '70% OFF'
    if (user.role === 'Practitioner') return '50% OFF'
    if (user.role === 'Learner') return '30% OFF'
    return 'Full Price'
  }

  return (
    <div className="min-h-[400px]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Schedule with Gary D. Kennedy</h2>
        <p className="text-gray-600 mt-1">
          Book private sessions and workshops. {user && (
            <>Your role: <strong>{user.role || 'User'}</strong> - {getRoleDiscount()}</>
          )}
        </p>
        {sessions.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">Initializing sessions...</p>
        )}
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            view === 'calendar'
              ? 'bg-primary-600 text-white'
              : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90'
          }`}
        >
          <div className="flex items-center gap-2">
            <FiCalendar />
            Calendar View
          </div>
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            view === 'list'
              ? 'bg-primary-600 text-white'
              : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90'
          }`}
        >
          <div className="flex items-center gap-2">
            <FiBookOpen />
            List View
          </div>
        </button>
      </div>

      {view === 'calendar' ? (
        sessions.length === 0 ? (
          <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30 text-center py-12">
            <FiCalendar className="mx-auto text-4xl mb-4 text-gray-300" />
            <p className="text-gray-500">Loading sessions...</p>
          </div>
        ) : (
        <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11)
                  setSelectedYear(selectedYear - 1)
                } else {
                  setSelectedMonth(selectedMonth - 1)
                }
              }}
              className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition"
            >
              ← Prev
            </button>
            <h3 className="text-xl font-bold text-gray-900">
              {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0)
                  setSelectedYear(selectedYear + 1)
                } else {
                  setSelectedMonth(selectedMonth + 1)
                }
              }}
              className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition"
            >
              Next →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: getFirstDayOfMonth(selectedMonth, selectedYear) }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square"></div>
            ))}
            {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }).map((_, idx) => {
              const day = idx + 1
              const date = new Date(selectedYear, selectedMonth, day)
              const daySessions = getSessionsForDate(date)
              const isToday = date.toDateString() === new Date().toDateString()
              const isPast = date < new Date() && !isToday

              return (
                <div
                  key={day}
                  className={`aspect-square border-2 rounded-lg p-2 ${
                    isToday
                      ? 'border-primary-500 bg-primary-50/50'
                      : isPast
                      ? 'border-gray-200 bg-gray-50/50'
                      : 'border-gray-200 bg-white/50 hover:border-primary-300 hover:bg-primary-50/30 transition cursor-pointer'
                  }`}
                  onClick={() => daySessions.length > 0 && setSelectedSession(daySessions[0])}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  {daySessions.length > 0 && (
                    <div className="space-y-1">
                      {daySessions.slice(0, 2).map(session => (
                        <div
                          key={session.id}
                          className="text-xs bg-primary-500 text-white px-1 py-0.5 rounded truncate"
                          title={session.title}
                        >
                          {session.title.substring(0, 15)}...
                        </div>
                      ))}
                      {daySessions.length > 2 && (
                        <div className="text-xs text-primary-600 font-semibold">
                          +{daySessions.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        )
      ) : (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-white/75 backdrop-blur-md rounded-xl border-2 border-white/30">
              <FiCalendar className="mx-auto text-4xl mb-4 text-gray-300" />
              <p className="text-gray-500">Loading sessions...</p>
            </div>
          ) : (
            sessions
              .filter(s => new Date(s.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(session => {
              const price = getSessionPrice(session.basePrice)
              const availableSeats = session.totalSeats - (session.bookedSeats?.length || 0)
              const isBooked = user?.id && session.bookedSeats?.some((seat: any) => seat.userId === user.id)
              const isFull = availableSeats <= 0

              return (
                <div
                  key={session.id}
                  className="bg-white/75 backdrop-blur-md rounded-xl shadow-md p-6 border-2 border-white/30 hover:border-primary-300/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{session.title}</h3>
                      <p className="text-gray-600 mb-4">{session.topic}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-primary-600" />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="text-primary-600" />
                          <span>{session.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUser className="text-primary-600" />
                          <span>{session.instructor}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-primary-600" />
                          <span className="font-semibold text-gray-900">
                            {availableSeats} / {session.totalSeats} seats available
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiDollarSign className={price === 0 ? 'text-green-600' : 'text-primary-600'} />
                          <span className={`font-bold ${price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {price === 0 ? 'FREE' : `${price} STOD Credits`}
                          </span>
                          {price < session.basePrice && (
                            <span className="text-xs text-gray-500 line-through">
                              {session.basePrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {isBooked && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold mb-4">
                          <FiCheckCircle />
                          You're booked!
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {isBooked ? (
                        <button
                          onClick={() => {
                            const booking = myBookings.find(b => b.sessionId === session.id)
                            if (booking) handleCancelBooking(booking)
                          }}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                        >
                          <FiXCircle />
                          Cancel Booking
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBookSession(session)}
                          disabled={isFull || (price > 0 && (!user || (user.credits || 0) < price))}
                          className={`px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                            isFull || (price > 0 && (!user || (user.credits || 0) < price))
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                          }`}
                        >
                          <FiCheckCircle />
                          {isFull ? 'Full' : (price > 0 && (user.credits || 0) < price) ? 'Insufficient Credits' : 'Book Session'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* My Bookings Section */}
      {myBookings.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">My Bookings</h3>
          <div className="space-y-3">
            {myBookings
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(booking => {
                const session = sessions.find(s => s.id === booking.sessionId)
                if (!session) return null

                return (
                  <div
                    key={booking.id}
                    className="bg-white/75 backdrop-blur-md rounded-lg p-4 border-2 border-white/30 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{booking.sessionTitle}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatDate(booking.date)} • {booking.pricePaid === 0 ? 'FREE' : `${booking.pricePaid} credits paid`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelBooking(booking)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full p-6 border-2 border-white/30">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedSession.title}</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-4">{selectedSession.topic}</p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-gray-700">
                <FiCalendar />
                <span>{formatDate(selectedSession.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FiClock />
                <span>{selectedSession.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FiUser />
                <span>{selectedSession.instructor}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FiUsers />
                <span>
                  {selectedSession.totalSeats - (selectedSession.bookedSeats?.length || 0)} / {selectedSession.totalSeats} seats available
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FiDollarSign />
                <span className="font-bold">
                  {getSessionPrice(selectedSession.basePrice) === 0 
                    ? 'FREE' 
                    : `${getSessionPrice(selectedSession.basePrice)} STOD Credits`}
                </span>
              </div>
            </div>
            {user?.id && selectedSession.bookedSeats?.some((seat: any) => seat.userId === user.id) ? (
              <button
                onClick={() => {
                  const booking = myBookings.find(b => b.sessionId === selectedSession.id)
                  if (booking) {
                    handleCancelBooking(booking)
                    setSelectedSession(null)
                  }
                }}
                className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
              >
                Cancel Booking
              </button>
            ) : (
              <button
                onClick={() => handleBookSession(selectedSession)}
                disabled={
                  selectedSession.totalSeats - (selectedSession.bookedSeats?.length || 0) <= 0 ||
                  (getSessionPrice(selectedSession.basePrice) > 0 && (!user || (user.credits || 0) < getSessionPrice(selectedSession.basePrice)))
                }
                className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
                  selectedSession.totalSeats - (selectedSession.bookedSeats?.length || 0) <= 0 ||
                  (getSessionPrice(selectedSession.basePrice) > 0 && (!user || (user.credits || 0) < getSessionPrice(selectedSession.basePrice)))
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                Book Session
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

