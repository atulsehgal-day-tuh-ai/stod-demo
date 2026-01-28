'use client'

import { useEffect, useMemo, useState } from 'react'
import { FiCheckCircle, FiX, FiEdit, FiUser, FiClock, FiArrowRight, FiMessageSquare, FiBookOpen } from 'react-icons/fi'
import { loadAnnotations, updateAnnotation } from './annotationsStorage'
import type { PrincipleAnnotation } from './annotationsStorage'
import DraftTimelineRail from './DraftTimelineRail'
import { loadDrafts, type DraftPrinciple } from './draftsStorage'

interface CuratorReviewProps {
  user: any
  principles: any[]
  setPrinciples: (principles: any[]) => void
}

export default function CuratorReview({ user, principles, setPrinciples }: CuratorReviewProps) {
  const [selectedPrinciple, setSelectedPrinciple] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewMode, setReviewMode] = useState('principles' as 'principles' | 'annotations' | 'drafts')
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null as number | null)
  const [annotationReviewNotes, setAnnotationReviewNotes] = useState('')
  const [annotationsVersion, setAnnotationsVersion] = useState(0)
  const [draftsVersion, setDraftsVersion] = useState(0)
  const [includeArchivedDrafts, setIncludeArchivedDrafts] = useState(false)
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null)
  const [draftTimelineOpen, setDraftTimelineOpen] = useState(false)

  const annotations = useMemo(() => loadAnnotations(), [annotationsVersion])
  const pendingAnnotations = annotations.filter((a) => a.status === 'Pending Review')
  const approvedAnnotations = annotations.filter((a) => a.status === 'Approved')
  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId) || null

  // Draft oversight: keep a lightweight refresh loop so moderators/admins see new drafts appear.
  const drafts = useMemo(() => loadDrafts(), [draftsVersion])
  useEffect(() => {
    const t = setInterval(() => setDraftsVersion((v) => v + 1), 1500)
    return () => clearInterval(t)
  }, [])

  const visibleDrafts = useMemo(() => {
    const list = Array.isArray(drafts) ? drafts : []
    return list
      .filter((d) => (includeArchivedDrafts ? true : String(d.status) !== 'Archived'))
      .slice()
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  }, [drafts, includeArchivedDrafts])

  const selectedDraft: DraftPrinciple | null = useMemo(() => {
    if (!selectedDraftId) return null
    return visibleDrafts.find((d) => Number(d.id) === Number(selectedDraftId)) || null
  }, [selectedDraftId, visibleDrafts])

  const inProcessPrinciples = principles.filter(p => p.status === 'In Process')
  const myCurated = principles.filter(p => p.curatorId === user.id && p.status === 'Core Principles')

  const workflowStages = [
    {
      id: 'Proposed',
      name: 'Proposed',
      description: 'Architect submission waiting for curator assignment.',
      assignee: 'Moderator',
      nextStage: 'Under Review',
      nextAction: 'Start Review',
    },
    {
      id: 'Under Review',
      name: 'Under Review',
      description: 'Curator is actively reviewing for quality and alignment.',
      assignee: 'Moderator',
      nextStage: 'Validated',
      nextAction: 'Approve & Validate',
    },
    {
      id: 'Validated',
      name: 'Validated',
      description: 'Curator approved. Ready for community input.',
      assignee: 'Community',
      nextStage: 'Community Q&A',
      nextAction: 'Open for Q&A',
    },
    {
      id: 'Community Q&A',
      name: 'Community Q&A',
      description: 'Open for questions and real-world examples.',
      assignee: 'Practitioners & Architects',
      nextStage: 'Published',
      nextAction: 'Publish',
    },
    {
      id: 'Published',
      name: 'Published',
      description: 'Final approval. Now in Core Principles.',
      assignee: 'System',
      nextStage: null,
      nextAction: null,
    },
  ]

  const getWorkflowStage = (principle: any) => {
    const stage = workflowStages.find(s => s.id === (principle.workflowStage || 'Proposed'))
    return stage || workflowStages[0]
  }

  const handleApprove = () => {
    if (!selectedPrinciple) return

    const currentStage = getWorkflowStage(selectedPrinciple)
    let nextStage = currentStage.nextStage
    let newStatus = selectedPrinciple.status
    let newAssignee = currentStage.assignee

    // Determine next stage based on current stage
    if (currentStage.id === 'Proposed') {
      nextStage = 'Under Review'
      newAssignee = user.name
    } else if (currentStage.id === 'Under Review') {
      nextStage = 'Validated'
      newAssignee = 'Community'
    } else if (currentStage.id === 'Validated') {
      nextStage = 'Community Q&A'
      newAssignee = 'Practitioners & Architects'
    } else if (currentStage.id === 'Community Q&A') {
      nextStage = 'Published'
      newStatus = 'Core Principles'
      newAssignee = 'System'
    }

    const updated = principles.map(p => {
      if (p.id === selectedPrinciple.id) {
        return {
          ...p,
          status: newStatus,
          workflowStage: nextStage || 'Published',
          currentAssignee: newAssignee,
          curatorId: user.id,
          curatorName: user.name,
          updatedAt: new Date().toISOString(),
        }
      }
      return p
    })
    setPrinciples(updated)
    localStorage.setItem('stod_principles', JSON.stringify(updated))
    setSelectedPrinciple(null)
    setReviewNotes('')
    alert(`Principle moved to ${nextStage || 'Published'}!`)
  }

  const handleAdvanceStage = (targetStage: string) => {
    if (!selectedPrinciple) return

    const stage = workflowStages.find(s => s.id === targetStage)
    if (!stage) return

    const updated = principles.map(p => {
      if (p.id === selectedPrinciple.id) {
        const newStatus = targetStage === 'Published' ? 'Core Principles' : 'In Process'
        return {
          ...p,
          status: newStatus,
          workflowStage: targetStage,
          currentAssignee: stage.assignee,
          curatorId: user.id,
          curatorName: user.name,
          updatedAt: new Date().toISOString(),
        }
      }
      return p
    })
    setPrinciples(updated)
    localStorage.setItem('stod_principles', JSON.stringify(updated))
    setSelectedPrinciple(null)
    setReviewNotes('')
    alert(`Principle moved to ${stage.name}!`)
  }

  const handleReject = () => {
    if (!selectedPrinciple) return
    if (confirm('Are you sure you want to reject this principle? It will be archived.')) {
      const updated = principles.map(p => {
        if (p.id === selectedPrinciple.id) {
          return {
            ...p,
            status: 'Archived',
            curatorId: user.id,
            curatorName: user.name,
            updatedAt: new Date().toISOString(),
          }
        }
        return p
      })
      setPrinciples(updated)
      localStorage.setItem('stod_principles', JSON.stringify(updated))
      setSelectedPrinciple(null)
      setReviewNotes('')
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Curator Review</h2>
        <p className="text-gray-600 mt-1">Review and validate submissions, ensuring they meet Universal Truth standards</p>
      </div>

      <div className="mb-6 flex gap-3">
        <button
          type="button"
          onClick={() => setReviewMode('principles')}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            reviewMode === 'principles' ? 'bg-primary-600 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'
          }`}
        >
          Principles
        </button>
        <button
          type="button"
          onClick={() => setReviewMode('annotations')}
          className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
            reviewMode === 'annotations' ? 'bg-primary-600 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'
          }`}
        >
          <FiMessageSquare />
          Annotations
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            reviewMode === 'annotations' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {pendingAnnotations.length}
          </span>
        </button>
        {(user?.role === 'Moderator' || user?.role === 'Admin') && (
          <button
            type="button"
            onClick={() => setReviewMode('drafts')}
            className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
              reviewMode === 'drafts' ? 'bg-primary-600 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'
            }`}
          >
            <FiEdit />
            Drafts
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                reviewMode === 'drafts' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {visibleDrafts.length}
            </span>
          </button>
        )}
      </div>

      {reviewMode === 'drafts' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">All drafts</h3>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={includeArchivedDrafts}
                  onChange={(e) => setIncludeArchivedDrafts(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Include archived
              </label>
            </div>

            <div className="space-y-3">
              {visibleDrafts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/40">
                  <FiEdit className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No drafts found.</p>
                </div>
              ) : (
                visibleDrafts.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedDraftId(d.id)
                      setDraftTimelineOpen(false)
                    }}
                    className={`w-full text-left bg-white/75 backdrop-blur-md rounded-xl shadow-md p-5 border-2 transition-all ${
                      selectedDraftId === d.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{d.fields?.title || 'Untitled draft'}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Owner: <span className="font-semibold">{d.ownerName}</span> • Status:{' '}
                          <span className="font-semibold">{d.status}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 shrink-0">
                        <FiClock />
                        {new Date(d.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="font-bold text-gray-600 uppercase tracking-wider">Suggestions</div>
                        <div className="mt-1 text-gray-900 font-semibold">{(d.suggestions || []).length}</div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="font-bold text-gray-600 uppercase tracking-wider">Collaborators</div>
                        <div className="mt-1 text-gray-900 font-semibold">{(d.collaborators || []).length}</div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="font-bold text-gray-600 uppercase tracking-wider">Open to requests</div>
                        <div className="mt-1 text-gray-900 font-semibold">{d.isOpenToCollaborators ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            {selectedDraft ? (
              <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30 sticky top-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xl font-bold text-gray-900">{selectedDraft.fields?.title || 'Untitled draft'}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Owner: <span className="font-semibold">{selectedDraft.ownerName}</span> • Status:{' '}
                      <span className="font-semibold">{selectedDraft.status}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Updated: {new Date(selectedDraft.updatedAt).toLocaleString()}</div>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold transition inline-flex items-center gap-2"
                    onClick={() => setDraftTimelineOpen((v) => !v)}
                  >
                    <FiClock />
                    Timeline
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Category</div>
                    <div className="text-gray-900 font-semibold mt-1">{selectedDraft.fields?.category || '—'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Take-home</div>
                    <div className="text-gray-900 font-semibold mt-1">{selectedDraft.fields?.takeHomeValue || '—'}</div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Description</div>
                  <div className="text-gray-800 mt-2 whitespace-pre-wrap">{selectedDraft.fields?.description || '—'}</div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Full text</div>
                  <div className="text-gray-800 mt-2 whitespace-pre-wrap">{selectedDraft.fields?.fullText || '—'}</div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Hard questions</div>
                  <div className="mt-2 space-y-2">
                    {(selectedDraft.fields?.hardQuestions || []).length === 0 ? (
                      <div className="text-gray-700">—</div>
                    ) : (
                      (selectedDraft.fields?.hardQuestions || []).map((q, idx) => (
                        <div key={idx} className="text-gray-800">
                          <span className="font-semibold">{idx + 1}.</span> {q}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {(() => {
                  const list = Array.isArray(selectedDraft.suggestions) ? selectedDraft.suggestions : []
                  const open = list.filter((s) => s.status === 'Open').length
                  const applied = list.filter((s) => s.status === 'Applied').length
                  const declined = list.filter((s) => s.status === 'Declined').length
                  return (
                    <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="font-bold text-gray-600 uppercase tracking-wider">Open</div>
                        <div className="mt-1 text-gray-900 font-semibold">{open}</div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="font-bold text-gray-600 uppercase tracking-wider">Applied</div>
                        <div className="mt-1 text-gray-900 font-semibold">{applied}</div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="font-bold text-gray-600 uppercase tracking-wider">Declined</div>
                        <div className="mt-1 text-gray-900 font-semibold">{declined}</div>
                      </div>
                    </div>
                  )
                })()}

                <DraftTimelineRail
                  draft={selectedDraft}
                  selectedSuggestionId={null}
                  mobileOpen={draftTimelineOpen}
                  onCloseMobile={() => setDraftTimelineOpen(false)}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/40 sticky top-4">
                <FiArrowRight className="mx-auto text-4xl mb-4 text-gray-300" />
                <p>Select a draft to view details.</p>
              </div>
            )}
          </div>
        </div>
      ) : reviewMode === 'annotations' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pending annotations</h3>
            <div className="space-y-4">
              {pendingAnnotations.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/40">
                  <FiMessageSquare className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No annotations pending review</p>
                </div>
              ) : (
                pendingAnnotations.map((a) => (
                  <div
                    key={a.id}
                    className={`bg-white/75 backdrop-blur-md rounded-xl shadow-md p-5 border-2 cursor-pointer transition-all ${
                      selectedAnnotationId === a.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => {
                      setSelectedAnnotationId(a.id)
                      setAnnotationReviewNotes('')
                    }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{a.principleTitle}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {a.section.replace('-', ' ')} • by {a.createdByName} ({a.createdByRole})
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        Pending
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">{a.text}</div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                      <FiClock />
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            {selectedAnnotation ? (
              <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Review annotation</h3>

                <div className="space-y-3 mb-6">
                  <div>
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Principle</div>
                    <div className="text-gray-900 font-semibold mt-1">{selectedAnnotation.principleTitle}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Section</div>
                      <div className="text-gray-800 mt-1">{selectedAnnotation.section.replace('-', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Author</div>
                      <div className="text-gray-800 mt-1">{selectedAnnotation.createdByName}</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">{selectedAnnotation.text}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Review Notes</label>
                  <textarea
                    value={annotationReviewNotes}
                    onChange={(e) => setAnnotationReviewNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional notes about your decision..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm('Reject this annotation?')) return
                      updateAnnotation(selectedAnnotation.id, {
                        status: 'Rejected',
                        reviewedBy: user.name,
                        reviewedAt: new Date().toISOString(),
                        reviewNotes: annotationReviewNotes.trim() || undefined,
                      })
                      setSelectedAnnotationId(null)
                      setAnnotationReviewNotes('')
                      setAnnotationsVersion((v) => v + 1)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition font-semibold border-2 border-red-200"
                  >
                    <FiX />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateAnnotation(selectedAnnotation.id, {
                        status: 'Approved',
                        reviewedBy: user.name,
                        reviewedAt: new Date().toISOString(),
                        reviewNotes: annotationReviewNotes.trim() || undefined,
                      })
                      setSelectedAnnotationId(null)
                      setAnnotationReviewNotes('')
                      setAnnotationsVersion((v) => v + 1)
                      alert('Annotation approved!')
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl"
                  >
                    <FiCheckCircle />
                    Approve
                  </button>
                </div>

                <div className="mt-5 text-xs text-gray-600">
                  Approved annotations become visible inside the Advanced Reader tool.
                </div>
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 border-2 border-dashed border-white/40 text-center">
                <FiEdit className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-500">Select an annotation to review</p>
                <p className="text-xs text-gray-500 mt-2">
                  Approved total: <span className="font-semibold">{approvedAnnotations.length}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
      <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-lg p-3">
              <FiClock className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{inProcessPrinciples.length}</div>
              <div className="text-sm text-blue-600">Pending Review</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-lg p-3">
              <FiCheckCircle className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{myCurated.length}</div>
              <div className="text-sm text-green-600">Curated by Me</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Principles in Process</h3>
          <div className="space-y-4">
            {inProcessPrinciples.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FiCheckCircle className="mx-auto text-4xl mb-4 text-gray-300" />
                <p>No principles pending review</p>
              </div>
            ) : (
              inProcessPrinciples.map((principle) => (
                <div
                  key={principle.id}
                  className={`bg-white/75 backdrop-blur-md rounded-xl shadow-md p-5 border-2 border-white/30 cursor-pointer transition-all ${
                    selectedPrinciple?.id === principle.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedPrinciple(principle)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{principle.title}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {principle.workflowStage || 'Proposed'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{principle.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <FiUser />
                    <span>By {principle.createdBy}</span>
                    <span className="text-gray-400">•</span>
                    <FiClock />
                    <span>{new Date(principle.createdAt).toLocaleDateString()}</span>
                  </div>
                  {principle.currentAssignee && (
                    <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      <strong>With:</strong> {principle.currentAssignee}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          {selectedPrinciple ? (
            <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-white/30 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Review Principle</h3>
              
              {/* Current Workflow Stage */}
              {(() => {
                const currentStage = getWorkflowStage(selectedPrinciple)
                return (
                  <div className="mb-6 p-4 bg-blue-50/70 backdrop-blur-sm rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-500 rounded-lg p-2">
                          <FiClock className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-blue-900">Current Stage: {currentStage.name}</div>
                          <div className="text-xs text-blue-700">With: {selectedPrinciple.currentAssignee || currentStage.assignee}</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-blue-800 mt-2">{currentStage.description}</p>
                  </div>
                )
              })()}
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <div className="text-gray-900 font-medium">{selectedPrinciple.title}</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <div className="text-gray-900">{selectedPrinciple.category}</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <div className="text-gray-700 text-sm">{selectedPrinciple.description}</div>
                </div>
                {selectedPrinciple.hardQuestions && selectedPrinciple.hardQuestions.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hard Questions</label>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      {selectedPrinciple.hardQuestions.map((q: string, idx: number) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedPrinciple.takeHomeValue && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Take Home Value</label>
                    <div className="text-gray-700 text-sm">{selectedPrinciple.takeHomeValue}</div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes about your review..."
                />
              </div>

              {/* Workflow Stage Actions */}
              {(() => {
                const currentStage = getWorkflowStage(selectedPrinciple)
                const canAdvance = currentStage.nextStage && ['Proposed', 'Under Review', 'Validated', 'Community Q&A'].includes(currentStage.id)
                
                return (
                  <div className="space-y-3">
                    {canAdvance && (
                      <div className="p-3 bg-green-50/70 rounded-lg border border-green-200">
                        <div className="text-sm font-semibold text-green-900 mb-1">Next Stage: {currentStage.nextStage}</div>
                        <div className="text-xs text-green-700">Will be assigned to: {workflowStages.find(s => s.id === currentStage.nextStage)?.assignee}</div>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleReject}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition font-semibold border-2 border-red-200"
                      >
                        <FiX />
                        Reject
                      </button>
                      {canAdvance && (
                        <button
                          onClick={handleApprove}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl"
                        >
                          <FiArrowRight />
                          {currentStage.nextAction || 'Advance'}
                        </button>
                      )}
                    </div>

                    {/* Quick Stage Navigation */}
                    {currentStage.id !== 'Published' && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-600 mb-2">Quick Navigation:</div>
                        <div className="flex flex-wrap gap-2">
                          {workflowStages.filter(s => s.id !== currentStage.id && s.id !== 'Published').map((stage) => (
                            <button
                              key={stage.id}
                              onClick={() => handleAdvanceStage(stage.id)}
                              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
                            >
                              → {stage.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 border-2 border-dashed border-white/40 text-center">
              <FiEdit className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-500">Select a principle to review</p>
            </div>
          )}
        </div>
      </div>
      </div>
      )}
    </div>
  )
}
