'use client'

import { useState, useEffect } from 'react'
import { FiTrendingUp, FiUsers, FiMessageSquare, FiBook, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [stats, setStats] = useState({
    activeArchitects: 5432,
    liveDebates: 86,
    principlesAppliedToday: 1024,
  })

  const [trending, setTrending] = useState({
    term: 'Leverage',
    change: 40,
    period: 'this week',
  })

  const [featuredPrinciples, setFeaturedPrinciples] = useState([
    {
      id: 1,
      title: 'Integrity',
      description: 'The quality of being honest and having strong moral principles.',
      reading: 143,
      debating: 16,
      live: true,
    },
    {
      id: 2,
      title: 'Clarity',
      description: 'The removal of ambiguity to reveal the true nature of a situation.',
      reading: 95,
      debating: 42,
      live: true,
    },
    {
      id: 3,
      title: 'Leverage',
      description: 'Using a small initial effort to achieve a much larger result.',
      reading: 308,
      debating: 63,
      live: true,
    },
  ])

  const [tickerMessages, setTickerMessages] = useState([
    { id: 1, text: 'Leverage" has seen a 40% increase in adoption this week' },
    { id: 2, text: 'New debate started: "Context vs Speed in Decision Making"' },
    { id: 3, text: '1,024 principles applied across teams today' },
    { id: 4, text: 'Architect "Sarah Chen" submitted 3 new principles' },
    { id: 5, text: 'Dissonance Matrix: 12 new tensions identified' },
  ])

  const [currentTickerIndex, setCurrentTickerIndex] = useState(0)
  const [tickerFade, setTickerFade] = useState(false)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [quoteFade, setQuoteFade] = useState(false)

  const garyKennedyQuotes = [
    {
      quote: "Same Thing Only Different",
      context: "Every problem is a variation of something you've seen before. Recognize the pattern.",
    },
    {
      quote: "Pay Attention",
      context: "Most people miss the obvious because they're not paying attention. The answer is often staring you in the face.",
    },
    {
      quote: "Context Matters",
      context: "The 'why' matters more than the 'what'. Understand the full picture before you act.",
    },
    {
      quote: "Apply to Real Life",
      context: "Principles are useless unless you apply them. Ask the hard questions. Make it real.",
    },
    {
      quote: "Learn from Experience",
      context: "Mistakes are expensive teachers, but they're the best ones. Don't pay the same price twice.",
    },
    {
      quote: "Recognize Patterns",
      context: "See the familiar in the unfamiliar. Connect the dots. The pattern is universal, the context changes.",
    },
  ]

  // Simulate real-time updates
  useEffect(() => {
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        activeArchitects: Math.max(5000, prev.activeArchitects + Math.floor(Math.random() * 3) - 1),
        liveDebates: Math.max(80, prev.liveDebates + Math.floor(Math.random() * 2) - 1),
        principlesAppliedToday: prev.principlesAppliedToday + Math.floor(Math.random() * 5),
      }))
    }, 3000) // Update every 3 seconds

    const tickerInterval = setInterval(() => {
      setTickerFade(true)
      setTimeout(() => {
        setCurrentTickerIndex(prev => (prev + 1) % tickerMessages.length)
        setTickerFade(false)
      }, 300)
    }, 5000) // Change ticker every 5 seconds

    const readingInterval = setInterval(() => {
      setFeaturedPrinciples(prev => prev.map(p => ({
        ...p,
        reading: p.reading + Math.floor(Math.random() * 3),
        debating: p.debating + (Math.random() > 0.7 ? 1 : 0),
      })))
    }, 4000) // Update reading counts every 4 seconds

    const quoteInterval = setInterval(() => {
      setQuoteFade(true)
      setTimeout(() => {
        setCurrentQuoteIndex(prev => (prev + 1) % garyKennedyQuotes.length)
        setQuoteFade(false)
      }, 500)
    }, 5000) // Change quote every 5 seconds

    return () => {
      clearInterval(statsInterval)
      clearInterval(tickerInterval)
      clearInterval(readingInterval)
      clearInterval(quoteInterval)
    }
  }, [tickerMessages.length, garyKennedyQuotes.length])

  const nextQuote = () => {
    setQuoteFade(true)
    setTimeout(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % garyKennedyQuotes.length)
      setQuoteFade(false)
    }, 500)
  }

  const prevQuote = () => {
    setQuoteFade(true)
    setTimeout(() => {
      setCurrentQuoteIndex(prev => (prev - 1 + garyKennedyQuotes.length) % garyKennedyQuotes.length)
      setQuoteFade(false)
    }, 500)
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/tree.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Quotes Slideshow Banner */}
        <div 
          className="w-full max-w-5xl mb-12 rounded-2xl p-8 border border-white/30 relative overflow-hidden"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Navigation Arrows */}
          <button
            onClick={prevQuote}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all border border-white/30 hover:scale-110"
            aria-label="Previous quote"
          >
            <FiChevronLeft className="text-xl" />
          </button>
          <button
            onClick={nextQuote}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all border border-white/30 hover:scale-110"
            aria-label="Next quote"
          >
            <FiChevronRight className="text-xl" />
          </button>

          {/* Quote Content */}
          <div 
            className={`text-center transition-opacity duration-500 ${quoteFade ? 'opacity-0' : 'opacity-100'}`}
          >
            <div className="text-3xl md:text-4xl font-bold text-white mb-4 italic drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)' }}>
              "{garyKennedyQuotes[currentQuoteIndex].quote}"
            </div>
            <div className="text-lg md:text-xl text-white/90 drop-shadow-md" style={{ textShadow: '0 1px 5px rgba(0, 0, 0, 0.4)' }}>
              {garyKennedyQuotes[currentQuoteIndex].context}
            </div>
            <div className="mt-6 text-sm text-white/70 italic">
              — Gary D. Kennedy
            </div>
          </div>

          {/* Quote Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {garyKennedyQuotes.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuoteFade(true)
                  setTimeout(() => {
                    setCurrentQuoteIndex(index)
                    setQuoteFade(false)
                  }, 500)
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentQuoteIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/40 w-2 hover:bg-white/60'
                }`}
                aria-label={`Go to quote ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-white mb-12 drop-shadow-2xl" style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.6)' }}>
          Featured Principles
        </h1>

        {/* Main Stats Card */}
        <div 
          className="w-full max-w-6xl mb-8 rounded-2xl p-8 border border-white/30"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-green-400 mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(74, 222, 128, 0.5)' }}>
                {stats.activeArchitects.toLocaleString()}
              </div>
              <div className="text-white text-sm font-semibold uppercase tracking-wide">Active Architects</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-400 mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(74, 222, 128, 0.5)' }}>
                {stats.liveDebates}
              </div>
              <div className="text-white text-sm font-semibold uppercase tracking-wide">Live Debates</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-400 mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(74, 222, 128, 0.5)' }}>
                {stats.principlesAppliedToday.toLocaleString()}
              </div>
              <div className="text-white text-sm font-semibold uppercase tracking-wide">Principles Applied Today</div>
            </div>
          </div>

          {/* Live Feed Ticker */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-4">
              <button className="bg-red-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-red-400/50">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE FEED
              </button>
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <FiTrendingUp className="text-white flex-shrink-0" />
                <div 
                  className={`text-white font-medium truncate transition-opacity duration-300 ${tickerFade ? 'opacity-0' : 'opacity-100'}`}
                >
                  <span className="font-bold">TRENDING:</span>{' '}
                  <span className="text-green-400">"{tickerMessages[currentTickerIndex].text}"</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Principles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-12">
          {featuredPrinciples.map((principle) => (
            <div
              key={principle.id}
              className="rounded-2xl p-6 border border-white/30"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-2xl font-bold text-white">{principle.title}</h3>
                {principle.live && (
                  <span className="bg-red-500/80 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-white/90 text-sm mb-4 leading-relaxed">{principle.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 text-white text-sm">
                  <FiBook className="text-green-400" />
                  <span>Reading: <span className="text-green-400 font-bold">{principle.reading}</span></span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <FiMessageSquare className="text-green-400" />
                  <span>Debating: <span className="text-green-400 font-bold">{principle.debating}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Get Started Button */}
        <button
          onClick={onGetStarted}
          className="group bg-gradient-to-r from-primary-600/90 to-primary-700/90 hover:from-primary-700 hover:to-primary-800 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 border border-white/30"
          style={{
            boxShadow: '0 8px 25px 0 rgba(79, 70, 229, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
          }}
        >
          <span>Get Started</span>
          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

