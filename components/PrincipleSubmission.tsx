'use client'

import { useEffect, useMemo, useState } from 'react'
import { FiUpload, FiCheckCircle, FiClock, FiUser, FiArrowRight, FiMessageSquare, FiBookOpen, FiUsers, FiLock, FiEdit2 } from 'react-icons/fi'
import { canCollaborate } from '@/lib/permissions'
import {
  approveAccessRequest,
  closePullRequest,
  createDraft,
  createPullRequest,
  denyAccessRequest,
  getDraftById,
  inviteCollaborator,
  loadDrafts,
  mergePullRequest,
  requestDraftAccess,
  revokeInvite,
  submitDraftForModeratorReview,
  updateDraft,
  type DraftFieldKey,
  type DraftPrinciple,
  type DraftPullRequest,
  type PullRequestPatch,
} from './draftsStorage'

interface PrincipleSubmissionProps {
  user: any
  principles: any[]
  setPrinciples: (principles: any[]) => void
  initialDraftId?: number | null
  initialStep?: 1 | 2 | 3
}

export default function PrincipleSubmission({ user, principles, setPrinciples, initialDraftId, initialStep }: PrincipleSubmissionProps) {
  const submitDraftToModerator = (d: DraftPrinciple) => {
    if (Number(d.ownerId) !== Number(user?.id)) {
      alert('Only the owner can submit this draft for moderator review.')
      return
    }

    // Collect contributors: owner + anyone who authored a merged PR.
    const mergedAuthors = d.pullRequests
      .filter((pr) => pr.status === 'Merged')
      .map((pr) => ({ id: pr.authorId, name: pr.authorName }))
    const contributors = [
      { id: Number(d.ownerId), name: String(d.ownerName || '') },
      ...mergedAuthors,
    ].filter((c, idx, arr) => arr.findIndex((x) => Number(x.id) === Number(c.id)) === idx)

    const newPrinciple = {
      id: Date.now(),
      title: d.fields.title,
      category: d.fields.category,
      description: d.fields.description,
      takeHomeValue: d.fields.takeHomeValue,
      fullText: d.fields.fullText,
      hardQuestions: (d.fields.hardQuestions || []).filter((q) => String(q || '').trim() !== ''),
      status: 'In Process',
      workflowStage: 'Proposed',
      currentAssignee: 'Moderator',
      assignedTo: null,
      version: '0.1',
      createdBy: d.ownerName,
      createdById: d.ownerId,
      contributors,
      draftId: d.id,
      likes: 0,
      savedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [...principles, newPrinciple]
    setPrinciples(updated)
    localStorage.setItem('stod_principles', JSON.stringify(updated))

    submitDraftForModeratorReview(d.id)
    refreshDrafts()
    alert('Draft submitted to Moderator review!')
  }
  const canUseCollab = canCollaborate(user?.role)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [draftsVersion, setDraftsVersion] = useState(0)
  const drafts = useMemo(() => loadDrafts(), [draftsVersion])
  const [activeDraftId, setActiveDraftId] = useState<number | null>(null)
  const activeDraft: DraftPrinciple | null = useMemo(() => (activeDraftId ? getDraftById(activeDraftId) : null), [activeDraftId, draftsVersion])

  const [selectedInviteUserId, setSelectedInviteUserId] = useState<number | null>(null)
  const [prField, setPrField] = useState<DraftFieldKey>('description')
  const [prMessage, setPrMessage] = useState('')
  const [prValueText, setPrValueText] = useState('')
  const [selectedPrId, setSelectedPrId] = useState<number | null>(null)

  // Simple user directory for invites (demo): try stod_users else fall back to current user + known demo users.
  const allUsers = useMemo(() => {
    try {
      const raw = localStorage.getItem('stod_users')
      const parsed = raw ? JSON.parse(raw) : null
      const list = Array.isArray(parsed) ? parsed : []
      if (list.length > 0) return list
    } catch {
      // ignore
    }

    const fallback = [
      { id: 1, name: 'System Admin', role: 'Admin' },
      { id: 2, name: 'Sarah Moderator', role: 'Moderator' },
      { id: 3, name: 'Sam Subscriber', role: 'Subscriber' },
      { id: 4, name: 'Nina Non-subscriber', role: 'Non-subscriber' },
    ]
    // Ensure current user is present
    const withCurrent = [{ id: user?.id, name: user?.name, role: user?.role }, ...fallback].filter((u) => u?.id != null)
    const uniq: any[] = []
    const seen = new Set<string>()
    for (const u of withCurrent) {
      const k = String(u.id)
      if (seen.has(k)) continue
      seen.add(k)
      uniq.push(u)
    }
    return uniq
  }, [user?.id, user?.name, user?.role])

  const subscriberUsers = useMemo(() => {
    return (allUsers || []).filter((u: any) => u?.role === 'Subscriber' && Number(u?.id) !== Number(user?.id))
  }, [allUsers, user?.id])

  const myDrafts = useMemo(() => drafts.filter((d) => Number(d.ownerId) === Number(user?.id)), [drafts, user?.id])
  const invitedTo = useMemo(() => drafts.filter((d) => d.invites.includes(Number(user?.id))), [drafts, user?.id])
  const collabOn = useMemo(() => drafts.filter((d) => d.collaborators.includes(Number(user?.id)) && Number(d.ownerId) !== Number(user?.id)), [drafts, user?.id])
  const requested = useMemo(() => drafts.filter((d) => d.accessRequests.includes(Number(user?.id))), [drafts, user?.id])

  const isOwner = !!activeDraft && Number(activeDraft.ownerId) === Number(user?.id)
  const hasAccess = !!activeDraft && activeDraft.collaborators.includes(Number(user?.id))

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    hardQuestions: ['', '', ''],
    takeHomeValue: '',
    fullText: '',
  })

  const mySubmissions = principles.filter(p => p.createdById === user.id)
  const inProcess = mySubmissions.filter(p => p.status === 'In Process')
  const corePrinciples = mySubmissions.filter(p => p.status === 'Core Principles')

  const workflowStages = [
    {
      id: 'Proposed',
      name: 'Proposed',
      description: 'Your submission has been received and is waiting for curator assignment.',
      assignee: 'Moderator',
      icon: FiUpload,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'Under Review',
      name: 'Under Review',
      description: 'A curator is actively reviewing your submission for quality and alignment with Universal Truths.',
      assignee: 'Moderator',
      icon: FiClock,
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'Validated',
      name: 'Validated',
      description: 'Curator has approved. The principle is ready for community input and refinement.',
      assignee: 'Community',
      icon: FiCheckCircle,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'Community Q&A',
      name: 'Community Q&A',
      description: 'Open for community questions, discussions, and real-world application examples.',
      assignee: 'Practitioners & Architects',
      icon: FiMessageSquare,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'Published',
      name: 'Published',
      description: 'Final approval complete. The principle is now part of Core Principles and available to all users.',
      assignee: 'System',
      icon: FiBookOpen,
      color: 'from-indigo-500 to-indigo-600',
    },
  ]

  const getWorkflowStage = (principle: any) => {
    return workflowStages.find(s => s.id === principle.workflowStage) || workflowStages[0]
  }

  const categories = ['Development', 'Security', 'Process', 'Quality', 'Documentation', 'Testing', 'Deployment', 'Finance', 'Productivity', 'Problem Solving']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const d = createDraft(
      { id: Number(user?.id || 0), name: String(user?.name || '') },
      {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        takeHomeValue: formData.takeHomeValue,
        fullText: formData.fullText,
        hardQuestions: formData.hardQuestions.filter((q) => String(q || '').trim() !== ''),
      }
    )

    refreshDrafts()
    setActiveDraftId(d.id)
    setStep(canUseCollab ? 2 : 3)

    setFormData({
      title: '',
      category: '',
      description: '',
      hardQuestions: ['', '', ''],
      takeHomeValue: '',
      fullText: '',
    })
    alert(canUseCollab ? 'Draft created! Next: Collaborate.' : 'Draft created! Next: Submit for review.')
  }

  const refreshDrafts = () => setDraftsVersion((v) => v + 1)

  useEffect(() => {
    if (!initialDraftId) return
    setActiveDraftId(initialDraftId)
    setStep(initialStep || (canUseCollab ? 2 : 3))
    // Ensure we reread storage in case it changed from other tabs.
    refreshDrafts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDraftId])

  const submitPullRequest = () => {
    if (!activeDraft) return
    if (!hasAccess) {
      alert('You do not have access to propose changes on this draft.')
      return
    }
    const msg = prMessage.trim()
    const raw = prValueText

    let patch: PullRequestPatch | null = null
    if (prField === 'hardQuestions') {
      const items = raw
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)
      patch = { field: 'hardQuestions', value: items }
    } else {
      patch = { field: prField as any, value: raw }
    }

    createPullRequest({
      draftId: activeDraft.id,
      authorId: Number(user?.id || 0),
      authorName: String(user?.name || ''),
      message: msg || undefined,
      patch,
    })
    setPrMessage('')
    setPrValueText('')
    refreshDrafts()
    alert('Pull request created!')
  }

  const currentFieldValue = (d: DraftPrinciple, field: DraftFieldKey) => {
    if (field === 'hardQuestions') return d.fields.hardQuestions
    return (d.fields as any)[field]
  }

  const selectedPR: DraftPullRequest | null = useMemo(() => {
    if (!activeDraft || !selectedPrId) return null
    return activeDraft.pullRequests.find((x) => x.id === selectedPrId) || null
  }, [activeDraft, selectedPrId])

  useEffect(() => {
    // Reset selected PR when switching drafts
    setSelectedPrId(null)
  }, [activeDraftId])

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Propose</h2>
          <p className="text-gray-600 mt-1">Workflow: Propose → Collaborate → Submit → Review → Publish</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`px-4 py-2 rounded-xl font-semibold border transition ${
            step === 1 ? 'bg-primary-600 text-white border-white/30' : 'bg-white/80 text-gray-700 border-white/60 hover:bg-white'
          }`}
        >
          1. Propose
        </button>
        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={!canUseCollab}
          className={`px-4 py-2 rounded-xl font-semibold border transition inline-flex items-center gap-2 ${
            step === 2 ? 'bg-primary-600 text-white border-white/30' : 'bg-white/80 text-gray-700 border-white/60 hover:bg-white'
          } ${!canUseCollab ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <FiUsers />
          2. Collaborate
          {!canUseCollab && <FiLock />}
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className={`px-4 py-2 rounded-xl font-semibold border transition ${
            step === 3 ? 'bg-primary-600 text-white border-white/30' : 'bg-white/80 text-gray-700 border-white/60 hover:bg-white'
          }`}
        >
          3. Submit
        </button>
      </div>

      {/* Collaborate */}
      {step === 2 && (
        <div className="space-y-6">
          {!canUseCollab && (
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
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
                  >
                    Continue to Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {canUseCollab && (
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
              {/* Left rail */}
              <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-5 border-2 border-white/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-bold text-gray-900">Drafts</div>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
                    onClick={() => {
                      const d = createDraft({ id: Number(user?.id || 0), name: String(user?.name || '') })
                      refreshDrafts()
                      setActiveDraftId(d.id)
                    }}
                  >
                    + New draft
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">My drafts</div>
                    <div className="mt-2 space-y-2">
                      {myDrafts.length === 0 ? (
                        <div className="text-sm text-gray-600">No drafts yet.</div>
                      ) : (
                        myDrafts.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setActiveDraftId(d.id)}
                            className={`w-full text-left p-3 rounded-xl border transition ${
                              activeDraftId === d.id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-200 bg-white'
                            }`}
                          >
                            <div className="font-semibold text-gray-900">{d.fields.title || 'Untitled draft'}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {d.status} • {new Date(d.updatedAt).toLocaleString()}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Invited to</div>
                    <div className="mt-2 space-y-2">
                      {invitedTo.length === 0 ? (
                        <div className="text-sm text-gray-600">No invites.</div>
                      ) : (
                        invitedTo.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setActiveDraftId(d.id)}
                            className={`w-full text-left p-3 rounded-xl border transition ${
                              activeDraftId === d.id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-200 bg-white'
                            }`}
                          >
                            <div className="font-semibold text-gray-900">{d.fields.title || 'Untitled draft'}</div>
                            <div className="text-xs text-gray-600 mt-1">Owner: {d.ownerName}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Collaborating on</div>
                    <div className="mt-2 space-y-2">
                      {collabOn.length === 0 ? (
                        <div className="text-sm text-gray-600">None yet.</div>
                      ) : (
                        collabOn.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setActiveDraftId(d.id)}
                            className={`w-full text-left p-3 rounded-xl border transition ${
                              activeDraftId === d.id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-200 bg-white'
                            }`}
                          >
                            <div className="font-semibold text-gray-900">{d.fields.title || 'Untitled draft'}</div>
                            <div className="text-xs text-gray-600 mt-1">Owner: {d.ownerName}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Requested</div>
                    <div className="mt-2 space-y-2">
                      {requested.length === 0 ? (
                        <div className="text-sm text-gray-600">No requests.</div>
                      ) : (
                        requested.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setActiveDraftId(d.id)}
                            className={`w-full text-left p-3 rounded-xl border transition ${
                              activeDraftId === d.id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-200 bg-white'
                            }`}
                          >
                            <div className="font-semibold text-gray-900">{d.fields.title || 'Untitled draft'}</div>
                            <div className="text-xs text-gray-600 mt-1">Owner: {d.ownerName}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Draft workspace */}
              <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30">
                {!activeDraft ? (
                  <div className="text-gray-700">Select a draft to collaborate.</div>
                ) : (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{activeDraft.fields.title || 'Untitled draft'}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Owner: <span className="font-semibold">{activeDraft.ownerName}</span> • Status:{' '}
                          <span className="font-semibold">{activeDraft.status}</span>
                        </div>
                        {isOwner && (
                          <label className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-gray-700">
                            <input
                              type="checkbox"
                              checked={!!activeDraft.isOpenToCollaborators}
                              onChange={(e) => {
                                updateDraft(activeDraft.id, { isOpenToCollaborators: e.target.checked })
                                refreshDrafts()
                              }}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            Open this draft to collaborator requests
                          </label>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!hasAccess && activeDraft.invites.includes(Number(user?.id)) && (
                          <button
                            type="button"
                            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
                            onClick={() => {
                              approveAccessRequest(activeDraft.id, Number(user?.id))
                              refreshDrafts()
                            }}
                          >
                            Accept invite
                          </button>
                        )}
                        {!hasAccess && !activeDraft.invites.includes(Number(user?.id)) && !activeDraft.accessRequests.includes(Number(user?.id)) && (
                          <button
                            type="button"
                            className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold transition"
                            onClick={() => {
                              requestDraftAccess(activeDraft.id, Number(user?.id))
                              refreshDrafts()
                              alert('Request sent!')
                            }}
                          >
                            Request access
                          </button>
                        )}
                        {isOwner && activeDraft.status === 'Draft' && (
                          <button
                            type="button"
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold transition"
                            onClick={() => {
                              setStep(3)
                            }}
                          >
                            Continue to Submit
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
                      {/* Draft details + PRs */}
                      <div className="space-y-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5">
                          <div className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <FiEdit2 />
                            Draft fields (current)
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Category</div>
                              <div className="text-gray-900 font-semibold mt-1">{activeDraft.fields.category || '—'}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Take-home</div>
                              <div className="text-gray-900 font-semibold mt-1">{activeDraft.fields.takeHomeValue || '—'}</div>
                            </div>
                          </div>
                          <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                            <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Description</div>
                            <div className="text-gray-800 mt-2 whitespace-pre-wrap">{activeDraft.fields.description || '—'}</div>
                          </div>
                          <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                            <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Hard questions</div>
                            <div className="mt-2 space-y-2">
                              {(activeDraft.fields.hardQuestions || []).length === 0 ? (
                                <div className="text-gray-700">—</div>
                              ) : (
                                (activeDraft.fields.hardQuestions || []).map((q, idx) => (
                                  <div key={idx} className="text-gray-800">
                                    <span className="font-semibold">{idx + 1}.</span> {q}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <FiMessageSquare />
                                Pull requests
                              </div>
                              <div className="text-xs text-gray-600 mt-1">Collaborators propose per-field changes. Owner merges.</div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
                            <div>
                              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Open PRs</div>
                              <div className="space-y-2">
                                {activeDraft.pullRequests.filter((p) => p.status === 'Open').length === 0 ? (
                                  <div className="text-sm text-gray-600">No open PRs.</div>
                                ) : (
                                  activeDraft.pullRequests
                                    .filter((p) => p.status === 'Open')
                                    .map((pr) => (
                                      <button
                                        key={pr.id}
                                        type="button"
                                        onClick={() => setSelectedPrId(pr.id)}
                                        className={`w-full text-left p-3 rounded-xl border transition ${
                                          selectedPrId === pr.id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-200 bg-white'
                                        }`}
                                      >
                                        <div className="text-sm font-semibold text-gray-900">{pr.patch.field}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          by {pr.authorName} • {new Date(pr.createdAt).toLocaleString()}
                                        </div>
                                        {pr.message ? <div className="text-xs text-gray-700 mt-1">{pr.message}</div> : null}
                                      </button>
                                    ))
                                )}
                              </div>

                              {hasAccess && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Create PR</div>
                                  <div className="space-y-3">
                                    <select
                                      value={prField}
                                      onChange={(e) => setPrField(e.target.value as DraftFieldKey)}
                                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                                    >
                                      <option value="title">title</option>
                                      <option value="category">category</option>
                                      <option value="description">description</option>
                                      <option value="takeHomeValue">takeHomeValue</option>
                                      <option value="fullText">fullText</option>
                                      <option value="hardQuestions">hardQuestions</option>
                                    </select>
                                    <textarea
                                      value={prValueText}
                                      onChange={(e) => setPrValueText(e.target.value)}
                                      rows={prField === 'hardQuestions' ? 5 : 4}
                                      placeholder={prField === 'hardQuestions' ? 'One question per line…' : 'Proposed value…'}
                                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                                    />
                                    <input
                                      value={prMessage}
                                      onChange={(e) => setPrMessage(e.target.value)}
                                      placeholder="PR message (optional)"
                                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                                    />
                                    <button
                                      type="button"
                                      className="w-full px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
                                      onClick={submitPullRequest}
                                    >
                                      Create PR
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Review</div>
                              {!selectedPR ? (
                                <div className="text-sm text-gray-600">Select an open PR to review.</div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="text-sm font-semibold text-gray-900">Side-by-side compare</div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                      <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Current</div>
                                      <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                                        {selectedPR.patch.field === 'hardQuestions'
                                          ? (currentFieldValue(activeDraft, 'hardQuestions') as string[]).join('\n') || '—'
                                          : String(currentFieldValue(activeDraft, selectedPR.patch.field as DraftFieldKey) || '—')}
                                      </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white border border-gray-200">
                                      <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Proposed</div>
                                      <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                                        {selectedPR.patch.field === 'hardQuestions'
                                          ? (selectedPR.patch.value as string[]).join('\n') || '—'
                                          : String((selectedPR.patch as any).value || '—')}
                                      </div>
                                    </div>
                                  </div>

                                  {isOwner ? (
                                    <div className="flex gap-2 pt-2">
                                      <button
                                        type="button"
                                        className="flex-1 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                                        onClick={() => {
                                          mergePullRequest(activeDraft.id, selectedPR.id, { id: Number(user?.id || 0), name: String(user?.name || '') })
                                          refreshDrafts()
                                          setSelectedPrId(null)
                                        }}
                                      >
                                        Merge
                                      </button>
                                      <button
                                        type="button"
                                        className="flex-1 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition border border-gray-200"
                                        onClick={() => {
                                          closePullRequest(activeDraft.id, selectedPR.id)
                                          refreshDrafts()
                                          setSelectedPrId(null)
                                        }}
                                      >
                                        Close
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-xs text-gray-600">Only the owner can merge/close PRs.</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Invites + requests */}
                      <div className="space-y-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5">
                          <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <FiUsers />
                            Collaborators
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {activeDraft.collaborators.length} with access
                          </div>

                          {isOwner ? (
                            <div className="mt-4 space-y-4">
                              <div>
                                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Invite a subscriber</div>
                                <div className="flex gap-2">
                                  <select
                                    value={selectedInviteUserId ?? ''}
                                    onChange={(e) => setSelectedInviteUserId(e.target.value ? Number(e.target.value) : null)}
                                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white"
                                  >
                                    <option value="">Select user…</option>
                                    {subscriberUsers.map((u: any) => (
                                      <option key={u.id} value={u.id}>
                                        {u.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
                                    onClick={() => {
                                      if (!selectedInviteUserId) return
                                      inviteCollaborator(activeDraft.id, Number(selectedInviteUserId))
                                      setSelectedInviteUserId(null)
                                      refreshDrafts()
                                    }}
                                  >
                                    Invite
                                  </button>
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Pending invites</div>
                                {activeDraft.invites.length === 0 ? (
                                  <div className="text-sm text-gray-600">None.</div>
                                ) : (
                                  <div className="space-y-2">
                                    {activeDraft.invites.map((id) => {
                                      const u = (allUsers as any[]).find((x) => Number(x.id) === Number(id))
                                      return (
                                        <div key={id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
                                          <div className="text-sm text-gray-900 font-semibold">{u?.name || `User ${id}`}</div>
                                          <button
                                            type="button"
                                            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 font-semibold"
                                            onClick={() => {
                                              revokeInvite(activeDraft.id, Number(id))
                                              refreshDrafts()
                                            }}
                                          >
                                            Revoke
                                          </button>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Access requests</div>
                                {activeDraft.accessRequests.length === 0 ? (
                                  <div className="text-sm text-gray-600">None.</div>
                                ) : (
                                  <div className="space-y-2">
                                    {activeDraft.accessRequests.map((id) => {
                                      const u = (allUsers as any[]).find((x) => Number(x.id) === Number(id))
                                      return (
                                        <div key={id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
                                          <div className="text-sm text-gray-900 font-semibold">{u?.name || `User ${id}`}</div>
                                          <div className="flex gap-2">
                                            <button
                                              type="button"
                                              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
                                              onClick={() => {
                                                approveAccessRequest(activeDraft.id, Number(id))
                                                refreshDrafts()
                                              }}
                                            >
                                              Approve
                                            </button>
                                            <button
                                              type="button"
                                              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 font-semibold"
                                              onClick={() => {
                                                denyAccessRequest(activeDraft.id, Number(id))
                                                refreshDrafts()
                                              }}
                                            >
                                              Deny
                                            </button>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 text-sm text-gray-600">
                              Only the draft owner can invite collaborators and approve requests.
                            </div>
                          )}
                        </div>

                        {activeDraft.mergeLog.length > 0 && (
                          <div className="rounded-2xl border border-gray-200 bg-white p-5">
                            <div className="text-sm font-bold text-gray-900">Merge log</div>
                            <div className="mt-3 space-y-2">
                              {activeDraft.mergeLog.slice(0, 8).map((m) => (
                                <div key={m.prId} className="text-xs text-gray-700 p-2 rounded-lg bg-gray-50 border border-gray-200">
                                  <span className="font-semibold">{m.summary}</span> • merged by {m.mergedByName} • {new Date(m.mergedAt).toLocaleString()}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-gray-900">Submit</div>
                <div className="text-sm text-gray-600">Final check before sending to Moderator review.</div>
              </div>
              <div className="flex items-center gap-2">
                {canUseCollab && (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold transition"
                  >
                    Back to Collaborate
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold transition"
                >
                  New Draft
                </button>
              </div>
            </div>

            {!activeDraft ? (
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                No draft selected yet. Create a draft in <span className="font-semibold">Propose</span> or open one in <span className="font-semibold">Collaborate</span>.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Title</div>
                  <div className="mt-1 font-semibold text-gray-900">{activeDraft.fields.title || 'Untitled draft'}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Category</div>
                    <div className="mt-1 text-gray-900">{activeDraft.fields.category || '—'}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Take-home</div>
                    <div className="mt-1 text-gray-900">{activeDraft.fields.takeHomeValue || '—'}</div>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Description</div>
                  <div className="mt-2 whitespace-pre-wrap text-gray-800">{activeDraft.fields.description || '—'}</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Full Text</div>
                  <div className="mt-2 whitespace-pre-wrap text-gray-800">{activeDraft.fields.fullText || '—'}</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Hard Questions</div>
                  <div className="mt-2 space-y-2">
                    {(activeDraft.fields.hardQuestions || []).length === 0 ? (
                      <div className="text-gray-600 text-sm">—</div>
                    ) : (
                      (activeDraft.fields.hardQuestions || []).map((q, idx) => (
                        <div key={idx} className="text-sm text-gray-800">
                          {idx + 1}. {q}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs text-gray-600">
                    Owner: <span className="font-semibold text-gray-900">{activeDraft.ownerName}</span> • Draft status:{' '}
                    <span className="font-semibold text-gray-900">{activeDraft.status}</span>
                  </div>
                  <button
                    type="button"
                    disabled={!isOwner || activeDraft.status !== 'Draft'}
                    onClick={() => submitDraftToModerator(activeDraft)}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition ${
                      !isOwner || activeDraft.status !== 'Draft'
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    Submit to Moderator review
                  </button>
                </div>
                {!isOwner && (
                  <div className="text-xs text-gray-600">
                    Only the draft owner can submit for Moderator review. You can still collaborate via pull requests.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct propose (existing) */}
      {step === 1 && (
        <>
          {/* Workflow Overview */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Approval Workflow</h3>
        <div className="relative">
          <div className="flex items-center justify-between">
            {workflowStages.map((stage, idx) => {
              const StageIcon = stage.icon
              return (
                <div key={stage.id} className="flex-1 flex flex-col items-center relative z-10">
                  {idx < workflowStages.length - 1 && (
                    <div 
                      className={`absolute top-5 left-1/2 h-0.5 w-full bg-gradient-to-r ${stage.color}`}
                      style={{ width: 'calc(100% - 40px)', marginLeft: '20px' }}
                    ></div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-gradient-to-r ${stage.color} text-white shadow-lg relative z-20`}>
                    <StageIcon className="text-sm" />
                  </div>
                  <div className="text-xs text-center font-semibold text-gray-900 max-w-[100px] mb-1">
                    {stage.name}
                  </div>
                  <div className="text-xs text-center text-gray-600 max-w-[100px]">
                    {stage.assignee}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>How it works:</strong> Your submission starts as <strong>Proposed</strong> and moves through 
            <strong> Under Review</strong> (Curator), <strong>Validated</strong> (Community), 
            <strong> Community Q&A</strong> (Practitioners), and finally <strong>Published</strong> (Core Principles).
          </p>
        </div>
      </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-lg p-3">
              <FiClock className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{inProcess.length}</div>
              <div className="text-sm text-blue-600">In Process</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-lg p-3">
              <FiCheckCircle className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{corePrinciples.length}</div>
              <div className="text-sm text-green-600">Core Principles</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 rounded-lg p-3">
              <FiUpload className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">{mySubmissions.length}</div>
              <div className="text-sm text-purple-600">Total Submissions</div>
            </div>
          </div>
        </div>
      </div>

        <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border-2 border-white/30">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Propose a Draft</h3>
          <div className="text-sm text-gray-600 mb-4">Create a draft first. If you’re a Subscriber, you can invite collaborators before submitting for Moderator review.</div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hard Questions * (at least 2 required)</label>
              {formData.hardQuestions.map((q, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={q}
                  onChange={(e) => {
                    const newQuestions = [...formData.hardQuestions]
                    newQuestions[idx] = e.target.value
                    setFormData({ ...formData, hardQuestions: newQuestions })
                  }}
                  placeholder={`Question ${idx + 1}`}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl mb-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Take Home Value</label>
              <input
                type="text"
                value={formData.takeHomeValue}
                onChange={(e) => setFormData({ ...formData, takeHomeValue: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="One-line summary of the key takeaway"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Text (optional)</label>
              <textarea
                value={formData.fullText}
                onChange={(e) => setFormData({ ...formData, fullText: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Long-form content for the principle…"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    title: '',
                    category: '',
                    description: '',
                    hardQuestions: ['', '', ''],
                    takeHomeValue: '',
                    fullText: '',
                  })
                }
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
              >
                Reset
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl"
              >
                Continue
              </button>
            </div>
          </form>
        </div>

          <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">My Submissions</h3>
        <div className="space-y-4">
          {mySubmissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiUpload className="mx-auto text-4xl mb-4 text-gray-300" />
              <p>No submissions yet. Submit your first principle!</p>
            </div>
          ) : (
            mySubmissions.map((principle) => {
              const stage = getWorkflowStage(principle)
              const StageIcon = stage.icon
              const currentStageIndex = workflowStages.findIndex(s => s.id === (principle.workflowStage || 'Proposed'))
              
              return (
                <div
                  key={principle.id}
                  className="bg-white/75 backdrop-blur-md rounded-xl shadow-md p-6 border-2 border-white/30 hover:border-green-300/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-bold text-gray-900">{principle.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      principle.status === 'Core Principles' ? 'bg-green-100 text-green-700' :
                      principle.status === 'In Process' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {principle.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{principle.description}</p>

                  {/* Workflow Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`bg-gradient-to-r ${stage.color} rounded-lg p-2`}>
                          <StageIcon className="text-white text-sm" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{stage.name}</div>
                          <div className="text-xs text-gray-600">With: {principle.currentAssignee || stage.assignee}</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{stage.description}</p>
                  </div>

                  {/* Workflow Stages Visualization */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="relative flex items-center justify-between">
                      {workflowStages.map((s, idx) => {
                        const SIcon = s.icon
                        const isActive = idx <= currentStageIndex
                        const isCurrent = s.id === principle.workflowStage
                        return (
                          <div key={s.id} className="flex-1 flex flex-col items-center relative z-10">
                            {idx < workflowStages.length - 1 && (
                              <div 
                                className={`absolute top-5 left-1/2 h-0.5 w-full ${
                                  idx < currentStageIndex 
                                    ? `bg-gradient-to-r ${s.color}` 
                                    : 'bg-gray-200'
                                }`}
                                style={{ width: 'calc(100% - 40px)', marginLeft: '20px' }}
                              ></div>
                            )}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all relative z-20 ${
                              isActive 
                                ? `bg-gradient-to-r ${s.color} text-white shadow-lg` 
                                : 'bg-gray-200 text-gray-400'
                            } ${isCurrent ? 'ring-4 ring-primary-300 scale-110' : ''}`}>
                              <SIcon className="text-sm" />
                            </div>
                            <div className={`text-xs text-center font-medium max-w-[80px] ${
                              isActive ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {s.name}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {principle.curatorName && (
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                      Curated by: <span className="font-semibold">{principle.curatorName}</span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
          </div>
        </>
      )}
    </div>
  )
}
