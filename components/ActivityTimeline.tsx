'use client'

import { useMemo } from 'react'
import { FiEdit2, FiMessageSquare, FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi'
import type { ActivityLogEntry, DraftPrinciple } from './draftsStorage'

function iconFor(type: ActivityLogEntry['type']) {
  if (type === 'OwnerEdit') return FiEdit2
  if (type === 'SuggestionCreated') return FiMessageSquare
  if (type === 'SuggestionApplied') return FiCheckCircle
  if (type === 'SuggestionDeclined') return FiXCircle
  return FiEye
}

function badgeClasses(type: ActivityLogEntry['type']) {
  if (type === 'OwnerEdit') return 'bg-blue-50 text-blue-700 border-blue-200'
  if (type === 'SuggestionApplied') return 'bg-green-50 text-green-700 border-green-200'
  if (type === 'SuggestionDeclined') return 'bg-red-50 text-red-700 border-red-200'
  if (type === 'SuggestionCreated') return 'bg-yellow-50 text-yellow-800 border-yellow-200'
  return 'bg-gray-50 text-gray-700 border-gray-200'
}

export default function ActivityTimeline({
  draft,
  selectedSuggestionId,
  onSelectSuggestion,
}: {
  draft: DraftPrinciple
  selectedSuggestionId: number | null
  onSelectSuggestion?: (suggestionId: number) => void
}) {
  const items = useMemo(() => {
    const list = Array.isArray(draft.activityLog) ? draft.activityLog : []
    return list
      .slice()
      .sort((a, b) => String(b.at).localeCompare(String(a.at)))
      .slice(0, 50)
  }, [draft.activityLog])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-gray-900">Activity timeline</div>
          <div className="text-xs text-gray-600 mt-1">All collaboration activity, including owner edits and suggestion outcomes.</div>
        </div>
        <div className="text-[11px] text-gray-600">Newest first</div>
      </div>

      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-gray-600">No activity yet.</div>
        ) : (
          items.map((e) => {
            const Icon = iconFor(e.type)
            const isSuggestionEvent = e.type !== 'OwnerEdit'
            const sid = isSuggestionEvent ? (e as any).suggestionId : null
            const active = sid != null && selectedSuggestionId != null && Number(sid) === Number(selectedSuggestionId)

            const buttonProps =
              sid != null && onSelectSuggestion
                ? {
                    role: 'button' as const,
                    tabIndex: 0,
                    onClick: () => onSelectSuggestion(Number(sid)),
                  }
                : {}

            return (
              <div
                key={e.id}
                className={`p-3 rounded-xl border transition ${
                  active ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-200'
                } ${sid != null && onSelectSuggestion ? 'cursor-pointer' : ''}`}
                {...buttonProps}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center border ${badgeClasses(e.type)}`}>
                      <Icon className="text-sm" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{e.summary}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {e.actorName} • {new Date(e.at).toLocaleString()}
                      </div>
                      {e.type === 'OwnerEdit' && (e as any).changedFields?.length ? (
                        <div className="text-[11px] text-gray-600 mt-1">
                          Fields: {(e as any).changedFields.join(', ')}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeClasses(e.type)}`}>
                    {e.type === 'OwnerEdit' ? 'Owner edit' : 'Suggestion'}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

