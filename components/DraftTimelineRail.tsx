'use client'

import { useEffect } from 'react'
import { FiX, FiClock } from 'react-icons/fi'
import ActivityTimeline from './ActivityTimeline'
import type { DraftPrinciple } from './draftsStorage'

export default function DraftTimelineRail({
  draft,
  selectedSuggestionId,
  onSelectSuggestion,
  mobileOpen,
  onCloseMobile,
}: {
  draft: DraftPrinciple
  selectedSuggestionId: number | null
  onSelectSuggestion?: (suggestionId: number) => void
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, onCloseMobile])

  if (!mobileOpen) return null

  return (
    <>
      {/* Drawer (all screen sizes) */}
      <div className="fixed inset-0 z-[200]" role="presentation">
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => onCloseMobile()}
        />
        <div
          className="absolute inset-y-0 right-0 w-full sm:max-w-md lg:max-w-lg bg-white shadow-2xl border-l border-gray-200"
          role="dialog"
          aria-modal="true"
          aria-label="Activity timeline"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <FiClock />
              Timeline
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onCloseMobile()
              }}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-700"
              aria-label="Close timeline"
            >
              <FiX />
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[calc(100vh-72px)]">
            <ActivityTimeline
              draft={draft}
              selectedSuggestionId={selectedSuggestionId}
              onSelectSuggestion={(id) => {
                onSelectSuggestion?.(id)
                onCloseMobile()
              }}
              maxItems={200}
            />
          </div>
        </div>
      </div>
    </>
  )
}

