'use client'

import { FiActivity, FiBookOpen, FiGrid, FiLayers, FiLock, FiMap, FiTool, FiZap } from 'react-icons/fi'

export type ToolKey = 'dissonance-matrix' | 'principle-map' | 'advanced-reader'

interface ToolsHubProps {
  user: any
  isSubscribed: boolean
  subscription: { plan: 'monthly' | 'annual'; startedAt: string; expiresAt: string } | null
  pendingTool: ToolKey | null
  onRequestTool: (tool: ToolKey) => void
  onSubscribe: (plan: 'monthly' | 'annual') => void
  onOpenTool: (tool: ToolKey) => void
}

export default function ToolsHub({
  user,
  isSubscribed,
  subscription,
  pendingTool,
  onRequestTool,
  onSubscribe,
  onOpenTool,
}: ToolsHubProps) {
  const tools: Array<{
    key: ToolKey | 'coming-soon'
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    enabled: boolean
  }> = [
    {
      key: 'dissonance-matrix',
      title: 'Dissonance Matrix',
      description: 'Explore tensions between principles and find your balance.',
      icon: FiZap,
      enabled: true,
    },
    {
      key: 'principle-map',
      title: 'Principle Map',
      description: 'Visualize how principles relate to each other.',
      icon: FiMap,
      enabled: true,
    },
    {
      key: 'advanced-reader',
      title: 'Advanced Reader',
      description: 'Read a principle and see related videos and upcoming sessions.',
      icon: FiBookOpen,
      enabled: true,
    },
    {
      key: 'coming-soon',
      title: 'Pattern Library',
      description: 'Browse recurring patterns across contexts. (Coming soon)',
      icon: FiLayers,
      enabled: false,
    },
    {
      key: 'coming-soon',
      title: 'Signal Tracker',
      description: 'Track signals and outcomes over time. (Coming soon)',
      icon: FiActivity,
      enabled: false,
    },
    {
      key: 'coming-soon',
      title: 'Decision Canvas',
      description: 'Structure decisions with context-first prompts. (Coming soon)',
      icon: FiGrid,
      enabled: false,
    },
  ]

  const credits = Number(user?.credits || 0)
  const expiresLabel = subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : ''

  return (
    <div className="min-h-[500px]">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-900">
          <FiTool className="text-primary-600" />
          <h2 className="text-2xl font-bold">Tools</h2>
        </div>
        <p className="text-gray-600 mt-1">
          Choose a tool to apply principles to real situations.
        </p>
      </div>

      {isSubscribed ? (
        <div className="mb-6 rounded-2xl bg-white/75 border border-white/40 backdrop-blur-md shadow-md p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-gray-900">Tools subscription active</div>
              <div className="text-sm text-gray-600 mt-1">
                Plan:{' '}
                <span className="font-semibold">
                  {subscription?.plan === 'annual' ? 'Annual' : 'Monthly'}
                </span>
                {expiresLabel ? (
                  <>
                    {' '}• Active until <span className="font-semibold">{expiresLabel}</span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="text-sm text-gray-700 font-semibold">
              Credits: <span className="text-gray-900">{credits.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl bg-white/75 border border-white/40 backdrop-blur-md shadow-md p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="text-lg font-bold text-gray-900">Unlock Tools</div>
              <div className="text-sm text-gray-600 mt-1">
                Tools are available to all roles, but require a subscription purchased with credits.
                {pendingTool ? (
                  <>
                    {' '}You tried to open <span className="font-semibold">{pendingTool.replaceAll('-', ' ')}</span>.
                  </>
                ) : null}
              </div>
              <div className="text-sm text-gray-700 font-semibold mt-2">
                Your credits: <span className="text-gray-900">{credits.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => onSubscribe('monthly')}
                disabled={credits < 250}
                className={`rounded-2xl p-4 border-2 text-left transition ${
                  credits < 250
                    ? 'bg-white/60 border-white/30 opacity-70 cursor-not-allowed'
                    : 'bg-white/85 border-white/60 hover:border-primary-300/60 hover:shadow-md'
                }`}
              >
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Monthly</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">250 credits</div>
                <div className="text-sm text-gray-600 mt-1">Access all tools for 30 days.</div>
              </button>

              <button
                type="button"
                onClick={() => onSubscribe('annual')}
                disabled={credits < 2500}
                className={`rounded-2xl p-4 border-2 text-left transition ${
                  credits < 2500
                    ? 'bg-white/60 border-white/30 opacity-70 cursor-not-allowed'
                    : 'bg-white/85 border-white/60 hover:border-primary-300/60 hover:shadow-md'
                }`}
              >
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Annual</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">2500 credits</div>
                <div className="text-sm text-gray-600 mt-1">Best value for 12 months.</div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((t, idx) => {
          const Icon = t.icon
          const locked = t.enabled && t.key !== 'coming-soon' && !isSubscribed
          return (
            <button
              key={`${t.title}-${idx}`}
              type="button"
              onClick={() => {
                if (!t.enabled) return
                if (t.key === 'coming-soon') return
                if (locked) {
                  onRequestTool(t.key)
                  return
                }
                onOpenTool(t.key)
              }}
              disabled={!t.enabled}
              className={`text-left rounded-2xl p-6 border-2 transition-all shadow-sm backdrop-blur-md ${
                t.enabled
                  ? 'bg-white/75 border-white/40 hover:border-primary-300/60 hover:shadow-lg'
                  : 'bg-white/55 border-white/30 opacity-70 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      t.enabled ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{t.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{t.description}</div>
                    {locked && (
                      <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-gray-700 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                        <FiLock />
                        Locked — subscribe to open
                      </div>
                    )}
                  </div>
                </div>

                {!t.enabled && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                    Soon
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

