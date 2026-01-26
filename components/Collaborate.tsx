'use client'

import { useMemo, useState } from 'react'
import { FiLock, FiUsers, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { canCollaborate } from '@/lib/permissions'
import { approveAccessRequest, loadDrafts, requestDraftAccess, type DraftPrinciple } from './draftsStorage'

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

  const openDrafts = useMemo(() => {
    return drafts
      .filter((d) => d?.status === 'Draft')
      .filter((d) => Number(d.ownerId) !== userId)
      .filter((d) => !!d?.isOpenToCollaborators)
      .slice()
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  }, [drafts, userId])

  const invitedDrafts = useMemo(() => {
    return drafts
      .filter((d) => d?.status === 'Draft')
      .filter((d) => d.invites.includes(userId))
      .slice()
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  }, [drafts, userId])

  const collabDrafts = useMemo(() => {
    return drafts
      .filter((d) => d?.status === 'Draft')
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
            approveAccessRequest(d.id, userId)
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
          Browse drafts open to collaborators. Request access to contribute, then open the draft to propose pull requests.
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
                    <div className="font-bold text-gray-600 uppercase tracking-wider">PRs</div>
                    <div className="mt-1 text-gray-900 font-semibold">{d.pullRequests.length}</div>
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

