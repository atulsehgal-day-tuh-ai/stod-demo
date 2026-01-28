'use client'

import { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface LandingPageProps {
  onGetStarted: () => void
  onSignUp: () => void
  onHowItWorks: () => void
  resumeUser?: any | null
  onContinue?: () => void
  onForgetUser?: () => void
}

const testimonials = [
  {
    firstName: 'Sarah',
    text: 'This repository helped our team align faster and make decisions with more confidence.',
  },
  {
    firstName: 'Michael',
    text: 'The principles are written clearly and are easy to apply in real-world situations.',
  },
  {
    firstName: 'Priya',
    text: 'We reduced rework by revisiting proven patterns and adapting them thoughtfully.',
  },
  {
    firstName: 'David',
    text: 'A simple system that keeps everyone grounded in shared language and intent.',
  },
  {
    firstName: 'Amina',
    text: 'The UI makes it easy to explore ideas and keep a living record of what works.',
  },
]

const featuredPrinciples = [
  {
    id: 1,
    title: 'Integrity',
    description: 'The quality of being honest and having strong moral principles.',
  },
  {
    id: 2,
    title: 'Clarity',
    description: 'The removal of ambiguity to reveal the true nature of a situation.',
  },
  {
    id: 3,
    title: 'Leverage',
    description: 'Using a small initial effort to achieve a much larger result.',
  },
]

export default function LandingPage({ onGetStarted, onSignUp, onHowItWorks, resumeUser, onContinue, onForgetUser }: LandingPageProps) {
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0)
  const [featuredFade, setFeaturedFade] = useState(false)

  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)
  const [testimonialFade, setTestimonialFade] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
      if (reduceMotion) return
    }

    const featuredInterval = setInterval(() => {
      setFeaturedFade(true)
      setTimeout(() => {
        setCurrentFeaturedIndex(prev => (prev + 1) % featuredPrinciples.length)
        setFeaturedFade(false)
      }, 350)
    }, 10000) // Advance slide every 10 seconds

    const testimonialInterval = setInterval(() => {
      setTestimonialFade(true)
      setTimeout(() => {
        setCurrentTestimonialIndex(prev => (prev + 1) % testimonials.length)
        setTestimonialFade(false)
      }, 350)
    }, 10000) // Advance testimonial every 10 seconds

    return () => {
      clearInterval(featuredInterval)
      clearInterval(testimonialInterval)
    }
  }, [])

  const nextFeatured = () => {
    setFeaturedFade(true)
    setTimeout(() => {
      setCurrentFeaturedIndex(prev => (prev + 1) % featuredPrinciples.length)
      setFeaturedFade(false)
    }, 350)
  }

  const prevFeatured = () => {
    setFeaturedFade(true)
    setTimeout(() => {
      setCurrentFeaturedIndex(prev => (prev - 1 + featuredPrinciples.length) % featuredPrinciples.length)
      setFeaturedFade(false)
    }, 350)
  }

  const nextTestimonial = () => {
    setTestimonialFade(true)
    setTimeout(() => {
      setCurrentTestimonialIndex(prev => (prev + 1) % testimonials.length)
      setTestimonialFade(false)
    }, 350)
  }

  const prevTestimonial = () => {
    setTestimonialFade(true)
    setTimeout(() => {
      setCurrentTestimonialIndex(prev => (prev - 1 + testimonials.length) % testimonials.length)
      setTestimonialFade(false)
    }, 350)
  }

  // Now navigates to a dedicated How It Works screen (handled by parent)

  return (
    <div className="min-h-screen relative overflow-hidden landing-bg">
      {/* Sleek (slightly darker for text readability) gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/24 via-black/6 to-black/28"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 pt-6 pb-12">
        {/* Top Right Navigation */}
        <div className="absolute top-6 left-0 right-0 z-20">
          <div className="mx-auto w-full max-w-6xl px-4 flex items-center justify-end gap-3">
            <button
              onClick={onHowItWorks}
              className="bg-white/10 hover:bg-white/18 backdrop-blur-md text-white font-semibold py-2 px-4 rounded-lg transition-all border border-white/40 shadow-lg shadow-black/20 hover:border-white/60"
            >
              How It Works
            </button>
            <button
              onClick={onSignUp}
              className="bg-white/10 hover:bg-white/18 backdrop-blur-md text-white font-semibold py-2 px-4 rounded-lg transition-all border border-white/40 shadow-lg shadow-black/20 hover:border-white/60"
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                if (resumeUser && onContinue) return onContinue()
                onGetStarted()
              }}
              className="bg-gradient-to-r from-primary-600/90 to-primary-700/90 hover:from-primary-700 hover:to-primary-800 backdrop-blur-md text-white font-bold py-2 px-4 rounded-lg transition-all border border-white/40 shadow-lg shadow-black/25 hover:border-white/70"
            >
              {resumeUser ? `Continue as ${String(resumeUser?.name || 'User')}` : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Hero: Same Thing Only Different (vertically centered) */}
        <div className="w-full flex-1 flex items-center justify-center pt-16 pb-6">
          <div className="w-full max-w-6xl">
            <div className="relative">
              {/* spotlight behind hero */}
              <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
                <div className="h-72 w-72 md:h-96 md:w-96 rounded-full bg-white/12 blur-3xl" />
              </div>

              <div className="mx-auto w-full max-w-4xl rounded-3xl p-8 md:p-10 glass-card glass-card--strong">
                <div className="text-center">
                  <div
                    className="text-5xl md:text-6xl font-bold italic tracking-tight text-white mb-6"
                    style={{ textShadow: '0 10px 30px rgba(0,0,0,0.65), 0 2px 10px rgba(0,0,0,0.6)' }}
                  >
                    Same Thing Only Different
                  </div>

                  <div
                    className="text-lg md:text-2xl text-white/90 leading-relaxed"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}
                  >
                    The wisdom of the universe is waiting for us to discover it. The key to unlocking universal secrets is to meld the{' '}
                    <span className="text-2xl md:text-3xl font-bold italic text-white">Same Things</span> that have worked for us in the past with{' '}
                    <span className="text-2xl md:text-3xl font-bold italic text-white">Only Different</span> element that renders a novel powerful solution.
                  </div>

                  {resumeUser && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => onContinue?.()}
                        className="w-full sm:w-auto bg-white/15 hover:bg-white/22 backdrop-blur-md text-white font-bold py-3 px-5 rounded-xl transition-all border border-white/40 shadow-lg shadow-black/25"
                      >
                        Continue as {String(resumeUser?.name || 'User')}
                      </button>
                      <button
                        type="button"
                        onClick={onGetStarted}
                        className="w-full sm:w-auto bg-white/10 hover:bg-white/18 backdrop-blur-md text-white font-semibold py-3 px-5 rounded-xl transition-all border border-white/35 shadow-lg shadow-black/20"
                      >
                        Sign in as someone else
                      </button>
                      <button
                        type="button"
                        onClick={() => onForgetUser?.()}
                        className="w-full sm:w-auto text-white/85 hover:text-white font-semibold underline underline-offset-4"
                      >
                        Not you?
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting content (balanced for visual impact) */}
        <div
          id="how-it-works"
          className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-24 -mt-2 md:-mt-6"
        >
          {/* Featured Principles Slideshow */}
          <div className="rounded-2xl p-8 glass-card relative flex flex-col min-h-[320px] md:min-h-[360px] overflow-hidden">
            <div className="text-white/90 text-sm font-semibold uppercase tracking-wider mb-4 drop-shadow">
              Featured Principles
            </div>

            {/* Navigation */}
            <button
              onClick={prevFeatured}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white p-3 rounded-full transition-all border border-white/20 hover:scale-110"
              aria-label="Previous featured principle"
            >
              <FiChevronLeft className="text-xl" />
            </button>
            <button
              onClick={nextFeatured}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white p-3 rounded-full transition-all border border-white/20 hover:scale-110"
              aria-label="Next featured principle"
            >
              <FiChevronRight className="text-xl" />
            </button>

            {/* Slide */}
            <div className={`transition-opacity duration-300 ${featuredFade ? 'opacity-0' : 'opacity-100'} flex-1 flex flex-col justify-center px-10`}>
              <div className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3 drop-shadow-lg">
                {featuredPrinciples[currentFeaturedIndex].title}
              </div>
              <div className="text-white/95 text-base md:text-lg leading-relaxed max-h-[7.5rem] overflow-hidden drop-shadow">
                {featuredPrinciples[currentFeaturedIndex].description}
              </div>
            </div>

            {/* Indicators */}
            <div className="mt-auto pt-6">
              <div className="flex justify-start gap-2">
                {featuredPrinciples.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFeaturedFade(true)
                      setTimeout(() => {
                        setCurrentFeaturedIndex(index)
                        setFeaturedFade(false)
                      }, 350)
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentFeaturedIndex
                        ? 'bg-white w-10'
                        : 'bg-white/40 w-2 hover:bg-white/60'
                    }`}
                    aria-label={`Go to featured principle ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Testimonials Slideshow */}
          <div className="rounded-2xl p-8 glass-card relative overflow-hidden flex flex-col min-h-[320px] md:min-h-[360px]" aria-label="Testimonials">
            <div className="text-white/90 text-sm font-semibold uppercase tracking-wider mb-4 drop-shadow">
              Testimonials
            </div>

            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white p-3 rounded-full transition-all border border-white/20 hover:scale-110"
              aria-label="Previous testimonial"
            >
              <FiChevronLeft className="text-xl" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white p-3 rounded-full transition-all border border-white/20 hover:scale-110"
              aria-label="Next testimonial"
            >
              <FiChevronRight className="text-xl" />
            </button>

            <div className={`transition-opacity duration-300 ${testimonialFade ? 'opacity-0' : 'opacity-100'} flex-1 flex flex-col justify-center px-10`}>
              <div className="text-white/95 text-lg md:text-xl italic leading-relaxed max-h-[9rem] overflow-hidden drop-shadow">
                “{testimonials[currentTestimonialIndex].text}”
              </div>
              <div className="mt-4 text-white font-semibold drop-shadow">
                {testimonials[currentTestimonialIndex].firstName}
              </div>
            </div>

            <div className="mt-auto pt-6">
              <div className="flex justify-start gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setTestimonialFade(true)
                      setTimeout(() => {
                        setCurrentTestimonialIndex(index)
                        setTestimonialFade(false)
                      }, 350)
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentTestimonialIndex
                        ? 'bg-white w-10'
                        : 'bg-white/40 w-2 hover:bg-white/60'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

