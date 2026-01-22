'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiHash,
  FiHelpCircle,
  FiEye,
  FiLock,
  FiMessageSquare,
  FiSave,
  FiStar,
  FiTag,
  FiUser,
} from 'react-icons/fi'
import { addAnnotation, type AnnotationSection } from './annotationsStorage'

interface PrincipleReaderModalProps {
  principle: any
  onClose: () => void
  canSave: boolean
  isSaved: boolean
  onToggleSave?: (id: number) => void
  canAccessHardQuestions: boolean
  canReveal: boolean
  onOpenAdvancedReader?: (principle: any) => void
  currentUser?: { id: number; name: string; role: string }
}

export default function PrincipleReaderModal({
  principle,
  onClose,
  canSave,
  isSaved,
  onToggleSave,
  canAccessHardQuestions,
  canReveal,
  onOpenAdvancedReader,
  currentUser,
}: PrincipleReaderModalProps) {
  const [revealContent, setRevealContent] = useState(false)
  const [showAnnotate, setShowAnnotate] = useState(false)
  const [annotationText, setAnnotationText] = useState('')
  const [annotationSection, setAnnotationSection] = useState<AnnotationSection>('general')

  const createdAt = useMemo(() => {
    const dt = principle?.createdAt ? new Date(principle.createdAt) : null
    return dt && !Number.isNaN(dt.getTime()) ? dt.toLocaleDateString() : ''
  }, [principle?.createdAt])

  const updatedAt = useMemo(() => {
    const dt = principle?.updatedAt ? new Date(principle.updatedAt) : null
    return dt && !Number.isNaN(dt.getTime()) ? dt.toLocaleDateString() : ''
  }, [principle?.updatedAt])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close reader"
        onClick={onClose}
      />

      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full px-4 py-8">
          <div className="mx-auto w-full max-w-5xl">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 text-white/90 hover:text-white font-semibold drop-shadow"
              >
                <FiArrowLeft />
                Back to Search
              </button>

              <div className="flex items-center gap-3">
                {onOpenAdvancedReader && (
                  <button
                    type="button"
                    onClick={() => onOpenAdvancedReader(principle)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border backdrop-blur-md transition bg-white/10 hover:bg-white/15 text-white border-white/40"
                  >
                    <FiBookOpen />
                    Advanced Reader
                  </button>
                )}

                {/* Click to reveal (Admin only) */}
                {canReveal && (
                  <button
                    type="button"
                    onClick={() => setRevealContent((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border backdrop-blur-md transition bg-white/10 hover:bg-white/15 text-white border-white/40"
                    aria-label="Click to reveal content"
                  >
                    <FiEye />
                    {revealContent ? 'Hide content' : 'Click to reveal'}
                  </button>
                )}

                {/* Annotate (only after reveal) */}
                {canReveal && revealContent && currentUser && (
                  <button
                    type="button"
                    onClick={() => setShowAnnotate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border backdrop-blur-md transition bg-white/10 hover:bg-white/15 text-white border-white/40"
                  >
                    <FiMessageSquare />
                    Add annotation
                  </button>
                )}

                {canSave && onToggleSave && (
                  <button
                    type="button"
                    onClick={() => onToggleSave(principle.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border backdrop-blur-md transition ${
                      isSaved
                        ? 'bg-primary-600/90 hover:bg-primary-600 text-white border-white/30'
                        : 'bg-white/10 hover:bg-white/15 text-white border-white/40'
                    }`}
                  >
                    <FiSave className={isSaved ? 'fill-current' : ''} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                )}
              </div>
            </div>

            {/* Reader shell */}
            <div className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
              {/* Header */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/70 via-black/50 to-black/40" />
                <div className="relative px-8 py-8 md:px-10 md:py-10 text-white">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80 mb-4">
                    <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                      <FiTag />
                      {principle.category || 'Principle'}
                    </span>
                    {principle.status && (
                      <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                        <FiBookOpen />
                        {principle.status}
                      </span>
                    )}
                    {principle.version && (
                      <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                        <FiHash />
                        v{principle.version}
                      </span>
                    )}
                    {typeof principle.likes === 'number' && (
                      <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                        <FiStar />
                        {principle.likes}
                      </span>
                    )}
                  </div>

                  <h1
                    className="text-3xl md:text-4xl font-bold tracking-tight leading-tight"
                    style={{ textShadow: '0 12px 34px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.6)' }}
                  >
                    {principle.title}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/85">
                    {principle.createdBy && (
                      <div className="flex items-center gap-2">
                        <FiUser />
                        <span>{principle.createdBy}</span>
                      </div>
                    )}
                    {updatedAt && (
                      <div className="flex items-center gap-2">
                        <FiClock />
                        <span>Updated {updatedAt}</span>
                      </div>
                    )}
                    {!updatedAt && createdAt && (
                      <div className="flex items-center gap-2">
                        <FiClock />
                        <span>Created {createdAt}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white/85 backdrop-blur-xl">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0">
                  {/* TOC */}
                  <div className="border-b lg:border-b-0 lg:border-r border-gray-200/70 px-6 py-6">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                      Reader
                    </div>
                    <div className="space-y-2">
                      <a href="#overview" className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800 font-semibold">
                        Overview
                      </a>
                      <a href="#take-home" className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800 font-semibold">
                        Take-home value
                      </a>
                      <a href="#questions" className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800 font-semibold">
                        Hard questions
                      </a>
                    </div>

                    {principle.curatorName && (
                      <div className="mt-6 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">Curated by:</span> {principle.curatorName}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-6 py-8 md:px-10">
                    {/* Blur wrapper */}
                    <div className="relative">
                      <div
                        className={`transition-[filter] duration-200 ${
                          canReveal && revealContent ? 'filter-none' : 'blur-md'
                        }`}
                        style={{ filter: canReveal && revealContent ? 'none' : 'blur(10px)' }}
                      >
                    <section id="overview" className="scroll-mt-24">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Overview</h2>
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {principle.description || '—'}
                      </p>
                    </section>

                    {(principle.fullText || principle.chapterText) && (
                      <>
                        <div className="my-8 border-t border-gray-200/70" />
                        <section id="chapter" className="scroll-mt-24">
                          <h2 className="text-xl font-bold text-gray-900 mb-3">Full principle</h2>
                          <div className="prose prose-slate max-w-none">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {principle.fullText || principle.chapterText}
                            </p>
                          </div>
                        </section>
                      </>
                    )}

                    <div className="my-8 border-t border-gray-200/70" />

                    <section id="take-home" className="scroll-mt-24">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Take-home value</h2>
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-50 to-white border border-primary-100">
                        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                          {principle.takeHomeValue || '—'}
                        </p>
                      </div>
                    </section>

                    <div className="my-8 border-t border-gray-200/70" />

                    <section id="questions" className="scroll-mt-24">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <FiHelpCircle className="text-primary-700" />
                          Hard questions
                        </h2>
                        {!canAccessHardQuestions && (
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <FiLock />
                            Members with deeper access can view these.
                          </div>
                        )}
                      </div>

                      {canAccessHardQuestions ? (
                        <div className="space-y-3">
                          {(principle.hardQuestions || []).length > 0 ? (
                            principle.hardQuestions.map((q: string, idx: number) => (
                              <div key={idx} className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                                <div className="text-gray-900 font-semibold">
                                  {idx + 1}. {q}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-600">No hard questions available.</div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-700">
                          Upgrade your role to view the “hard questions” prompts for this principle.
                        </div>
                      )}
                    </section>
                      </div>

                      {!(canReveal && revealContent) && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="px-4 py-2 rounded-xl bg-black/60 text-white text-sm font-semibold backdrop-blur-md border border-white/20">
                            {canReveal ? 'Click “Click to reveal” to view content' : 'Content blurred for this role'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-white/70 text-xs">
              Tip: Press <span className="font-semibold text-white/85">Esc</span> to close.
            </div>
          </div>
        </div>
      </div>

      {/* Annotation modal */}
      {showAnnotate && (
        <div className="fixed inset-0 z-[110]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close annotation"
            onClick={() => setShowAnnotate(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/40 overflow-hidden">
              <div className="p-5 border-b border-gray-200/70 flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-bold text-gray-900">Annotation</div>
                  <div className="text-sm text-gray-600 mt-1">
                    This will be submitted for review and can appear in Advanced Reader after approval.
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700 font-semibold"
                  onClick={() => setShowAnnotate(false)}
                >
                  Close
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
                  <select
                    value={annotationSection}
                    onChange={(e) => setAnnotationSection(e.target.value as AnnotationSection)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200"
                  >
                    <option value="general">General</option>
                    <option value="overview">Overview</option>
                    <option value="full">Full principle</option>
                    <option value="take-home">Take-home value</option>
                    <option value="questions">Hard questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your comment</label>
                  <textarea
                    value={annotationText}
                    onChange={(e) => setAnnotationText(e.target.value)}
                    rows={5}
                    placeholder="Share your real-world experience applying this principle…"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAnnotate(false)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) return
                      const text = annotationText.trim()
                      if (!text) {
                        alert('Please write a comment before submitting.')
                        return
                      }
                      addAnnotation({
                        principleId: Number(principle?.id),
                        principleTitle: String(principle?.title || ''),
                        section: annotationSection,
                        text,
                        createdById: Number(currentUser.id),
                        createdByName: String(currentUser.name || ''),
                        createdByRole: String(currentUser.role || ''),
                      })
                      setAnnotationText('')
                      setAnnotationSection('general')
                      setShowAnnotate(false)
                      alert('Annotation submitted for review!')
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle />
                    Submit for review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

