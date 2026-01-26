'use client'

import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiCompass,
  FiEye,
  FiBook,
  FiLayers,
  FiPlay,
  FiCalendar,
  FiZap,
  FiUsers,
  FiShield,
} from 'react-icons/fi'

interface HowItWorksProps {
  onGoHome: () => void
  onSignIn: () => void
  onSignUp: () => void
}

export default function HowItWorks({ onGoHome, onSignIn, onSignUp }: HowItWorksProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-purple-50">
      <div className="min-h-screen px-4 py-10">
        <div className="mx-auto w-full max-w-6xl">
          {/* Top nav */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onGoHome}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold"
            >
              <FiArrowLeft />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onSignUp}
                className="bg-white/80 hover:bg-white backdrop-blur-md text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all border border-white/70 shadow-sm hover:shadow-md"
              >
                Sign Up
              </button>
              <button
                onClick={onSignIn}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-2 px-4 rounded-lg transition-all border border-white/30 shadow-md hover:shadow-lg"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Hero */}
          <div className="rounded-3xl p-8 md:p-10 mb-8 bg-white/85 backdrop-blur-md shadow-xl border border-white/60">
            <div className="max-w-4xl">
              <div className="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiCompass />
                How It Works
              </div>
              <h1 className="text-4xl md:text-5xl font-bold italic tracking-tight text-gray-900 mb-5">
                Same Thing Only Different Community
              </h1>
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                This is a shared space to capture <span className="font-semibold">principles</span>, align on <span className="font-semibold">universal truths</span>, and apply them to real
                situations. The idea is simple: identify the <span className="font-bold italic">Same Things</span> that work across contexts, then adapt the{' '}
                <span className="font-bold italic">Only Different</span> details for the situation in front of you.
              </p>
            </div>
          </div>

          {/* Main sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/85 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-white/60">
                <div className="text-gray-900 text-xl font-bold mb-4 flex items-center gap-2">
                  <FiLayers />
                  The flow (in plain English)
                </div>

                <ol className="space-y-4 text-gray-800">
                  <li className="flex gap-3">
                    <FiCheckCircle className="mt-1 flex-shrink-0 text-primary-600" />
                    <div>
                      <div className="font-semibold">Explore featured principles</div>
                      <div className="text-gray-600">
                        Start by browsing principles that are already in the repository and see how they’re written—clear, testable, and usable.
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <FiCheckCircle className="mt-1 flex-shrink-0 text-primary-600" />
                    <div>
                      <div className="font-semibold">Apply them to real decisions</div>
                      <div className="text-gray-600">
                        Use a principle as a lens: clarify the context, spot the repeating pattern, then decide what’s “only different” this time.
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <FiCheckCircle className="mt-1 flex-shrink-0 text-primary-600" />
                    <div>
                      <div className="font-semibold">Contribute new principles (or improvements)</div>
                      <div className="text-gray-600">
                        Submit a principle when you’ve learned something durable. Great principles are concise, actionable, and easy to remember.
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <FiCheckCircle className="mt-1 flex-shrink-0 text-primary-600" />
                    <div>
                      <div className="font-semibold">Review & curate for quality</div>
                      <div className="text-gray-600">
                        The community benefits when content is curated: duplicates are merged, unclear entries are refined, and the best rise to the top.
                      </div>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-white/85 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-white/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-gray-900 text-xl font-bold flex items-center gap-2">
                      <FiCompass className="text-primary-700" />
                      Try this in 60 seconds
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      A quick path to value—start as a Non-subscriber and upgrade when you want more.
                    </div>
                  </div>
                  <div className="hidden sm:block text-xs font-bold px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-800">
                    Beginner-friendly
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-primary-50 to-white">
                  <img
                    src="/tree.png"
                    alt="Repository preview"
                    className="h-36 w-full object-cover opacity-90"
                  />
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="font-semibold text-gray-900">Search for a pattern you’re facing</div>
                    <div className="text-gray-600 mt-1">
                      Use keywords like “context”, “attention”, or “iteration” to find something reusable.
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="font-semibold text-gray-900">Save 1–2 principles</div>
                    <div className="text-gray-600 mt-1">
                      Subscribers can build a personal library so the best ideas are one click away.
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="font-semibold text-gray-900">Ask one “hard question”</div>
                    <div className="text-gray-600 mt-1">
                      Subscribers unlock deeper prompts that turn reading into decision-making.
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="font-semibold text-gray-900">Connect to a video or session</div>
                    <div className="text-gray-600 mt-1">
                      Advanced Reader helps link what you read to real learning and practice.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/85 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-white/60">
                <div className="text-gray-900 text-xl font-bold mb-4 flex items-center gap-2">
                  <FiZap className="text-primary-700" />
                  Tool highlights
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-primary-50 border border-primary-100">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <FiBook className="text-primary-700" />
                      Advanced Reader
                    </div>
                    <div className="text-gray-600 mt-2">
                      Link a section of a principle to related videos, sessions, and community annotations.
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <FiPlay className="text-emerald-700" />
                      Videos
                    </div>
                    <div className="text-gray-600 mt-2">
                      Learn the thinking behind the principles and see how they’re applied in the real world.
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-amber-50 border border-amber-100">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <FiCalendar className="text-amber-700" />
                      Sessions
                    </div>
                    <div className="text-gray-600 mt-2">
                      Practice with the community. Included for everyone during Phase 1.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-white/60">
              <div className="text-gray-900 text-xl font-bold mb-4 flex items-center gap-2">
                <FiUsers />
                Roles (demo)
              </div>
              <div className="text-gray-700 text-sm leading-relaxed">
                <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 mb-4">
                  <div className="font-semibold text-gray-900 mb-1">Everyone is welcome</div>
                  <div className="text-gray-700">
                    Start as a <span className="font-semibold">Non-subscriber</span> to explore. Upgrade when you’re ready for subscriber benefits.
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <FiEye />
                      Non-subscriber
                    </div>
                    <div className="mt-2 text-gray-700">
                      <div className="font-semibold text-gray-900">Access</div>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Access everything during Phase 1</li>
                        <li>Great for first-time exploration</li>
                      </ul>
                      <div className="mt-2 font-semibold text-gray-900">Best for</div>
                      <div>New visitors who want to learn the “Same Thing Only Different” approach.</div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <FiBook />
                      Subscriber
                    </div>
                    <div className="mt-2 text-gray-700">
                      <div className="font-semibold text-gray-900">Access</div>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Access everything during Phase 1</li>
                        <li>Later: premium tools + community benefits</li>
                      </ul>
                      <div className="mt-2 font-semibold text-gray-900">Benefits of upgrading</div>
                      <div>Deeper learning loops, tools, and community participation as we tighten permissions.</div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <FiCheckCircle />
                      Moderator
                    </div>
                    <div className="mt-2 text-gray-700">
                      <div className="font-semibold text-gray-900">Access</div>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Review/curate submissions and approve community annotations</li>
                        <li>Keep the library high-signal and consistent</li>
                      </ul>
                      <div className="mt-2 font-semibold text-gray-900">Focus</div>
                      <div>Quality control and curation workflows.</div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <FiUsers />
                      Admin
                    </div>
                    <div className="mt-2 text-gray-700">
                      <div className="font-semibold text-gray-900">Access</div>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Full system control + user management</li>
                        <li>All content, tools, and workflows</li>
                      </ul>
                      <div className="mt-2 font-semibold text-gray-900">Benefits</div>
                      <div>Operate and govern the platform end-to-end.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-white/15">
                <div className="text-gray-500 text-xs">
                  Note: this demo uses in-browser storage and demo users. A production version would use real accounts + a backend.
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 bg-white/85 backdrop-blur-md rounded-2xl p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl border border-white/60">
            <div>
              <div className="text-gray-900 font-bold text-xl mb-1">Ready to jump in?</div>
              <div className="text-gray-700">
                Sign in with a demo role, or use Sign Up (demo) to see the onboarding flow.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onSignIn}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-2 px-4 rounded-lg transition-all border border-white/30 shadow-md hover:shadow-lg"
              >
                Sign In <FiArrowRight className="inline ml-2" />
              </button>
              <button
                onClick={onSignUp}
                className="bg-white/80 hover:bg-white backdrop-blur-md text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all border border-white/70 shadow-sm hover:shadow-md"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Security / trust note */}
          <div className="mt-6 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
            <FiShield />
            Your data in this demo is stored locally in your browser.
          </div>
        </div>
      </div>
    </div>
  )
}

