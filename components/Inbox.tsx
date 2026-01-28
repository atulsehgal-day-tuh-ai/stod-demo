'use client'

import { useMemo, useState } from 'react'
import { FiBell, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { loadNotificationsForUser, markAllRead, markNotificationRead, type UserNotification } from './notificationsStorage'

function titleFor(n: UserNotification) {
  if (n.kind === 'InviteReceived') return 'Invite received'
  if (n.kind === 'InviteRevoked') return 'Invite revoked'
  if (n.kind === 'AccessRequested') return 'Access requested'
  if (n.kind === 'AccessApproved') return 'Access approved'
  if (n.kind === 'AccessDenied') return 'Access denied'
  if (n.kind === 'SuggestionCreated') return 'New suggestion'
  if (n.kind === 'SuggestionCommented') return 'New comment'
  if (n.kind === 'SuggestionApplied') return 'Suggestion applied'
  if (n.kind === 'SuggestionDeclined') return 'Suggestion declined'
  if (n.kind === 'OwnerEdit') return 'Owner edit'
  if (n.kind === 'StageTransition') return 'Stage change'
  if (n.kind === 'DraftSubmitted') return 'Submitted'
  return 'Update'
}

export default function Inbox({
  user,
  onOpenDraft,
}: {
  user: any
  onOpenDraft: (draftId: number) => void
}) {
  const userId = Number(user?.id || 0)
  const [version, setVersion] = useState(0)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const items = useMemo(() => {
    const list = loadNotificationsForUser(userId)
    const filtered = showUnreadOnly ? list.filter((n) => !n.read) : list
    return filtered.slice().sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 100)
  }, [userId, version, showUnreadOnly])

  const unreadCount = useMemo(() => loadNotificationsForUser(userId).filter((n) => !n.read).length, [userId, version])

  return (
    <div className="space-y-6">
      <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <FiBell />
              Inbox
            </div>
            <div className="text-gray-600 mt-2 text-sm">Invites, access updates, suggestions, comments, and stage changes.</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`px-3 py-2 rounded-xl font-semibold border transition ${
                showUnreadOnly ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setShowUnreadOnly((v) => !v)}
            >
              {showUnreadOnly ? 'Showing unread' : 'All'}
            </button>
            <button
              type="button"
              disabled={unreadCount === 0}
              className={`px-3 py-2 rounded-xl font-semibold transition inline-flex items-center gap-2 ${
                unreadCount === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
              onClick={() => {
                markAllRead(userId)
                setVersion((v) => v + 1)
              }}
            >
              <FiCheckCircle />
              Mark all read
            </button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-600 bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30">No activity yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-4 transition ${
                n.read ? 'bg-white border-gray-200' : 'bg-primary-50/40 border-primary-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {titleFor(n)}
                    {n.draftTitle ? <span className="text-gray-700"> • {n.draftTitle}</span> : null}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {n.actorName ? `${n.actorName} • ` : ''}
                    {new Date(n.at).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{n.message}</div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {n.draftId != null ? (
                    <button
                      type="button"
                      className="px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition inline-flex items-center gap-2"
                      onClick={() => {
                        markNotificationRead(userId, n.id)
                        setVersion((v) => v + 1)
                        onOpenDraft(Number(n.draftId))
                      }}
                    >
                      Open draft
                      <FiArrowRight />
                    </button>
                  ) : null}
                  {!n.read ? (
                    <button
                      type="button"
                      className="px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold transition"
                      onClick={() => {
                        markNotificationRead(userId, n.id)
                        setVersion((v) => v + 1)
                      }}
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

