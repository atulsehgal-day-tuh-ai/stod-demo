'use client'

import { useEffect, useMemo, useState } from 'react'
import { FiLock, FiUsers, FiArrowRight, FiCheckCircle, FiBell } from 'react-icons/fi'
import { canCollaborate } from '@/lib/permissions'
import { approveAccessRequest, loadDrafts, requestDraftAccess, type DraftPrinciple } from './draftsStorage'
import { loadNotificationsForUser, markAllRead, markNotificationRead, type UserNotification } from './notificationsStorage'

export default function Collaborate({
  user,
  onOpenDraft,
}: {
  user: any
  onOpenDraft: (draftId: number) => void
}) {
  const canUse = canCollaborate(user?.role)
  const [version, setVersion] = useState(0)
  const drafts = useMemo(() => loadDrafts(), [version])

  const userId = Number(user?.id || 0)
  const isClosedToCollaboration = (d: DraftPrinciple) => d?.status === 'Archived' || d?.status === 'SubmittedForReview'
  const [inboxVersion, setInboxVersion] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setInboxVersion((v) => v + 1), 1500)
    return () => clearInterval(t)
  }, [])

  const collabKinds = useMemo(() => {
    return new Set<UserNotification['kind']>([
      'InviteReceived',
      'InviteRevoked',
      'AccessRequested',
      'AccessApproved',
      'AccessDenied',
      'SuggestionCreated',
      'SuggestionCommented',
      'SuggestionApplied',
      'SuggestionDeclined',
      'OwnerEdit',
      'StageTransition',
      'DraftSubmitted',
    ])
  }, [])

  const collabInbox = useMemo(() => {
    const list = loadNotificationsForUser(userId)
    return list
      .filter((n) => collabKinds.has(n.kind))
      .slice()
      .sort((a, b) => String(b.at).localeCompare(String(a.at)))
      .slice(0, 6)
  }, [userId, inboxVersion, collabKinds])

  const collabUnread = useMemo(() => {
    const list = loadNotificationsForUser(userId)
    return list.filter((n) => !n.read && collabKinds.has(n.kind)).length
  }, [userId, inboxVersion, collabKinds])

  const openDrafts = useMemo(() => {
    return drafts
      .filter((d) => d?.status === 'Draft' || d?.status === 'Collaborating')
      .filter((d) => Number(d.ownerId) !== userId)
      .filter((d) => !!d?.isOpenToCollaborators)
      .slice()
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  }, [drafts, userId])

  const invitedDrafts = useMemo(() => {
    return drafts
      .filter((d) => !isClosedToCollaboration(d))
      .filter((d) => d.invites.includes(userId))
      .slice()
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  }, [drafts, userId])

  const collabDrafts = useMemo(() => {
    return drafts
      .filter((d) => !isClosedToCollaboration(d))
      .filter((d) => Number(d.ownerId) !== userId)
      .filter((d) => d.collaborators.includes(userId))
      .slice()
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  }, [drafts, userId])

  if (!canUse) {
    return (
      <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/60" />
        <div className="relative">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <FiLock className="text-gray-700" />
            Collaborate (Locked)
          </div>
          <div className="text-gray-600 mt-2">
            Collaboration is available to <span className="font-semibold">Subscribers</span> and above.
          </div>
        </div>
      </div>
    )
  }

  const renderAction = (d: DraftPrinciple) => {
    const hasAccess = d.collaborators.includes(userId)
    const isInvited = d.invites.includes(userId)
    const hasRequested = d.accessRequests.includes(userId)

    if (hasAccess) {
      return (
        <button
          type="button"
          onClick={() => onOpenDraft(d.id)}
          className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition inline-flex items-center gap-2"
        >
          Open
          <FiArrowRight />
        </button>
      )
    }

    if (isInvited) {
      return (
        <button
          type="button"
          onClick={() => {
            approveAccessRequest(d.id, userId, { id: userId, name: String(user?.name || `User ${userId}`) })
            setVersion((v) => v + 1)
          }}
          className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition inline-flex items-center gap-2"
        >
          Accept invite
          <FiCheckCircle />
        </button>
      )
    }

    if (hasRequested) {
      return (
        <button
          type="button"
          disabled
          className="px-4 py-2 rounded-xl bg-gray-200 text-gray-600 font-semibold cursor-not-allowed"
        >
          Requested
        </button>
      )
    }

    return (
      <button
        type="button"
        onClick={() => {
          requestDraftAccess(d.id, userId)
          setVersion((v) => v + 1)
          alert('Request sent!')
        }}
        className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold transition"
      >
        Request access
      </button>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30">
        <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <FiUsers />
          Collaborate
        </div>
        <div className="text-gray-600 mt-2">
          Browse drafts open to collaborators. Request access to contribute, then open the draft to propose suggestions.
        </div>
      </div>

      <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <FiBell />
            Inbox
            {collabUnread > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[22px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold">
                {collabUnread > 99 ? '99+' : collabUnread}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={collabUnread === 0}
            className={`px-4 py-2 rounded-xl font-semibold transition inline-flex items-center gap-2 ${
              collabUnread === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
            onClick={() => {
              markAllRead(userId)
              setInboxVersion((v) => v + 1)
            }}
          >
            <FiCheckCircle />
            Mark all read
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {collabInbox.length === 0 ? (
            <div className="text-sm text-gray-600">No recent collaboration updates.</div>
          ) : (
            collabInbox.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition ${n.read ? 'border-gray-200 bg-white' : 'border-primary-200 bg-primary-50/40'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{n.draftTitle ? n.draftTitle : 'Draft update'}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {n.actorName ? `${n.actorName} • ` : ''}
                      {new Date(n.at).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{n.message}</div>
                  </div>

                  <div className="shrink-0 flex flex-col gap-2 items-end">
                    {n.draftId != null && (
                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition inline-flex items-center gap-2"
                        onClick={() => {
                          markNotificationRead(userId, n.id)
                          setInboxVersion((v) => v + 1)
                          onOpenDraft(Number(n.draftId))
                        }}
                      >
                        Open
                        <FiArrowRight />
                      </button>
                    )}
                    {!n.read && (
                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold transition"
                        onClick={() => {
                          markNotificationRead(userId, n.id)
                          setInboxVersion((v) => v + 1)
                        }}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Tip: use the top navigation <span className="font-semibold">Inbox</span> tab for the full feed.
        </div>
      </div>

      {(invitedDrafts.length > 0 || collabDrafts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {invitedDrafts.map((d) => (
            <div key={d.id} className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-5 border-2 border-white/30">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Invited</div>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-gray-900">{d.fields.title || 'Untitled draft'}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Owner: <span className="font-semibold">{d.ownerName}</span> • Updated: {new Date(d.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div>{renderAction(d)}</div>
              </div>
            </div>
          ))}

          {collabDrafts.map((d) => (
            <div key={d.id} className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-5 border-2 border-white/30">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Collaborating</div>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-gray-900">{d.fields.title || 'Untitled draft'}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Owner: <span className="font-semibold">{d.ownerName}</span> • Updated: {new Date(d.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div>{renderAction(d)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="text-sm font-bold text-gray-900 mb-3">Open drafts</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {openDrafts.length === 0 ? (
            <div className="text-sm text-gray-600 bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30">
              No open drafts right now.
            </div>
          ) : (
            openDrafts.map((d) => (
              <div key={d.id} className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-5 border-2 border-white/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{d.fields.title || 'Untitled draft'}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Owner: <span className="font-semibold">{d.ownerName}</span> • Updated: {new Date(d.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div>{renderAction(d)}</div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="font-bold text-gray-600 uppercase tracking-wider">Collaborators</div>
                    <div className="mt-1 text-gray-900 font-semibold">{d.collaborators.length}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="font-bold text-gray-600 uppercase tracking-wider">Requests</div>
                    <div className="mt-1 text-gray-900 font-semibold">{d.accessRequests.length}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="font-bold text-gray-600 uppercase tracking-wider">Suggestions</div>
                    <div className="mt-1 text-gray-900 font-semibold">{d.suggestions.length}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

