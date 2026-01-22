'use client'

import { useEffect, useMemo, useState } from 'react'
import { FiBookOpen, FiCalendar, FiCheckCircle, FiClock, FiExternalLink, FiFilm, FiLock, FiMessageSquare, FiSearch } from 'react-icons/fi'
import { addAnnotation, loadAnnotations, type AnnotationSection, type PrincipleAnnotation } from './annotationsStorage'

type Principle = any

function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4)
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0
  let intersection = 0
  a.forEach((x) => {
    if (b.has(x)) intersection++
  })
  const union = a.size + b.size - intersection
  return union > 0 ? intersection / union : 0
}

function intersectionTop(a: Set<string>, b: Set<string>, topN: number) {
  const common = Array.from(a).filter((x) => b.has(x))
  common.sort()
  return common.slice(0, topN)
}

export default function AdvancedReader({
  user,
  principles,
  initialPrincipleId,
  onGoToVideos,
  onGoToSessions,
  isPrincipleUnlocked,
  unlockPrice,
  onUnlockPrinciple,
}: {
  user: any
  principles: Principle[]
  initialPrincipleId?: number | null
  onGoToVideos?: () => void
  onGoToSessions?: () => void
  isPrincipleUnlocked?: (principleId: number) => boolean
  unlockPrice?: number
  onUnlockPrinciple?: (principle: any) => void
}) {
  const canReveal = ['Admin', 'Moderator', 'Contributor'].includes(user?.role || '')

  const [selectedId, setSelectedId] = useState<number | null>(initialPrincipleId ?? null)
  const [focus, setFocus] = useState<'overview' | 'full' | 'take-home' | 'questions'>('overview')
  const [revealContent, setRevealContent] = useState(false)
  const [videos, setVideos] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showAnnotate, setShowAnnotate] = useState(false)
  const [annotationText, setAnnotationText] = useState('')
  const [annotationsVersion, setAnnotationsVersion] = useState(0)

  useEffect(() => {
    if (initialPrincipleId != null) setSelectedId(initialPrincipleId)
  }, [initialPrincipleId])

  useEffect(() => {
    // Videos
    const storedVideos = localStorage.getItem('stod_videos')
    if (storedVideos) {
      try {
        setVideos(JSON.parse(storedVideos))
      } catch {
        setVideos([])
      }
    } else {
      // Lightweight seed (Videos page has fuller seed too)
      const sample = [
        {
          id: 1,
          title: 'Same Thing Only Different - Deep Dive',
          description: 'Pattern recognition and applying the familiar to the unfamiliar.',
          category: 'Universal Truth',
          instructor: 'Gary D. Kennedy',
          duration: '24:35',
          principleId: 1,
          uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          title: 'Pay Attention - The Art of Observation',
          description: 'Exercises for noticing what others miss.',
          category: 'Wisdom',
          instructor: 'Gary D. Kennedy',
          duration: '18:42',
          principleId: 2,
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setVideos(sample)
      localStorage.setItem('stod_videos', JSON.stringify(sample))
    }

    // Sessions
    const storedSessions = localStorage.getItem('stod_sessions')
    if (storedSessions) {
      try {
        setSessions(JSON.parse(storedSessions))
      } catch {
        setSessions([])
      }
    } else {
      const now = new Date()
      const sample = [
        {
          id: 1,
          title: 'Same Thing Only Different - Masterclass',
          topic: 'Deep dive into pattern recognition and seeing the familiar in the unfamiliar',
          instructor: 'Gary D. Kennedy',
          date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 90,
          status: 'Open',
        },
        {
          id: 2,
          title: 'Context Matters - Understanding the Why',
          topic: 'How to ask the right questions and understand the full picture before acting',
          instructor: 'Gary D. Kennedy',
          date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 75,
          status: 'Open',
        },
      ]
      setSessions(sample)
      localStorage.setItem('stod_sessions', JSON.stringify(sample))
    }
  }, [])

  const selectedPrinciple = useMemo(() => {
    const byId = (principles || []).find((p) => Number(p.id) === Number(selectedId))
    return byId || (principles || [])[0] || null
  }, [principles, selectedId])

  const isLocked = useMemo(() => {
    const id = Number(selectedPrinciple?.id)
    if (!selectedPrinciple || !Number.isFinite(id)) return false
    if (!isPrincipleUnlocked) return false
    return !isPrincipleUnlocked(id)
  }, [selectedPrinciple, isPrincipleUnlocked])

  useEffect(() => {
    if (selectedId == null && selectedPrinciple?.id != null) setSelectedId(Number(selectedPrinciple.id))
  }, [selectedId, selectedPrinciple?.id])

  const focusText = useMemo(() => {
    if (!selectedPrinciple) return ''
    if (focus === 'overview') return String(selectedPrinciple.description || '')
    if (focus === 'full') return String(selectedPrinciple.fullText || selectedPrinciple.chapterText || '')
    if (focus === 'take-home') return String(selectedPrinciple.takeHomeValue || '')
    const qs = Array.isArray(selectedPrinciple.hardQuestions) ? selectedPrinciple.hardQuestions.join('\n') : ''
    return String(qs || '')
  }, [selectedPrinciple, focus])

  const focusSection = useMemo<AnnotationSection>(() => {
    if (focus === 'overview') return 'overview'
    if (focus === 'full') return 'full'
    if (focus === 'take-home') return 'take-home'
    if (focus === 'questions') return 'questions'
    return 'general'
  }, [focus])

  const focusTokens = useMemo(() => new Set(tokenize(`${selectedPrinciple?.title || ''} ${focusText}`)), [selectedPrinciple?.title, focusText])

  const filteredPrincipleOptions = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = (principles || []).slice()
    if (!q) return list
    return list.filter((p) => String(p.title || '').toLowerCase().includes(q) || String(p.category || '').toLowerCase().includes(q))
  }, [principles, search])

  const relatedVideos = useMemo(() => {
    const scored = (videos || []).map((v) => {
      const blob = `${v.title || ''} ${v.description || ''} ${v.category || ''} ${v.instructor || ''} ${v.principleTitle || ''}`
      const vt = new Set(tokenize(blob))
      const sim = jaccard(focusTokens, vt)
      const bonus = selectedPrinciple?.id && v.principleId && Number(v.principleId) === Number(selectedPrinciple.id) ? 0.2 : 0
      const score = sim + bonus
      return {
        v,
        score,
        matched: intersectionTop(focusTokens, vt, 6),
      }
    })
    return scored
      .filter((x) => x.score > 0.06)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }, [videos, focusTokens, selectedPrinciple?.id])

  const relatedSessions = useMemo(() => {
    const now = Date.now()
    const upcoming = (sessions || []).filter((s) => {
      const ts = s?.date ? Date.parse(s.date) : 0
      return ts >= now
    })
    const scored = upcoming.map((s) => {
      const blob = `${s.title || ''} ${s.topic || ''} ${s.instructor || ''}`
      const st = new Set(tokenize(blob))
      const sim = jaccard(focusTokens, st)
      const score = sim
      return {
        s,
        score,
        matched: intersectionTop(focusTokens, st, 6),
      }
    })
    return scored
      .filter((x) => x.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }, [sessions, focusTokens])

  const approvedAnnotations = useMemo(() => {
    const pid = Number(selectedPrinciple?.id)
    if (!Number.isFinite(pid)) return []
    const all = loadAnnotations()
    return all
      .filter((a) => a.status === 'Approved' && Number(a.principleId) === pid)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }, [selectedPrinciple?.id, annotationsVersion])

  return (
    <div className="min-h-[560px]">
      <div className="mb-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <FiBookOpen className="text-primary-600" />
            <div className="text-2xl font-bold">Advanced Reader</div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Link a part of the principle to <span className="font-semibold">videos</span> and <span className="font-semibold">upcoming sessions</span>.
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Reader */}
        <div className="rounded-2xl bg-white/75 border border-white/40 backdrop-blur-md shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-200/60">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Pick a principle</div>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search principles…"
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/90 border border-white/70 shadow-sm"
                  />
                </div>
                <div className="mt-2">
                  <select
                    value={selectedPrinciple?.id ?? ''}
                    onChange={(e) => setSelectedId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-white/70 shadow-sm text-gray-900"
                  >
                    {filteredPrincipleOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} {p.category ? `— ${p.category}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {canReveal ? (
                  <button
                    type="button"
                    onClick={() => setRevealContent((v) => !v)}
                    className="px-4 py-2 rounded-xl font-semibold border transition bg-primary-600/90 hover:bg-primary-700 text-white border-white/30"
                    aria-label="Click to reveal content"
                  >
                    {revealContent ? 'Hide content' : 'Click to reveal'}
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 text-sm text-gray-700 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
                    <FiLock />
                    Blurred for this role
                  </div>
                )}

                {canReveal && revealContent && (
                  <button
                    type="button"
                    onClick={() => setShowAnnotate(true)}
                    className="px-4 py-2 rounded-xl font-semibold border transition bg-white/85 hover:bg-white text-gray-900 border-white/60 shadow-sm flex items-center justify-center gap-2"
                  >
                    <FiMessageSquare />
                    Add annotation
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {([
                { key: 'overview', label: 'Overview' },
                { key: 'full', label: 'Full principle' },
                { key: 'take-home', label: 'Take-home' },
                { key: 'questions', label: 'Hard questions' },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setFocus(t.key)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                    focus === t.key
                      ? 'bg-primary-600 text-white border-white/30'
                      : 'bg-white/70 text-gray-800 border-white/60 hover:bg-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {selectedPrinciple ? (
              <div>
                <div className="text-2xl font-bold text-gray-900">{selectedPrinciple.title}</div>
                <div className="mt-2 text-sm text-gray-600">
                  {selectedPrinciple.category ? <span className="font-semibold">{selectedPrinciple.category}</span> : null}
                  {selectedPrinciple.createdBy ? <span> • {selectedPrinciple.createdBy}</span> : null}
                </div>

                {isLocked ? (
                  <div className="mt-6 rounded-2xl bg-gray-900/85 text-white border border-white/20 p-5">
                    <div className="text-lg font-bold">Locked for Looker</div>
                    <div className="text-sm text-white/85 mt-2">
                      Unlock this principle to read it in Advanced Reader.
                      {typeof unlockPrice === 'number' ? (
                        <>
                          {' '}Cost: <span className="font-semibold">{unlockPrice} credits</span>.
                        </>
                      ) : null}
                    </div>
                    {onUnlockPrinciple && (
                      <button
                        type="button"
                        onClick={() => onUnlockPrinciple(selectedPrinciple)}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-white text-gray-900 hover:bg-white/90 transition"
                      >
                        <FiExternalLink />
                        Unlock now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 relative">
                  <div
                    className={`transition-[filter] duration-200 ${canReveal && revealContent ? 'filter-none' : 'blur-md'}`}
                    style={{ filter: canReveal && revealContent ? 'none' : 'blur(10px)' }}
                  >
                    <div className="prose prose-slate max-w-none">
                      {focus === 'overview' && <p className="whitespace-pre-wrap">{selectedPrinciple.description || '—'}</p>}
                      {focus === 'full' && (
                        <p className="whitespace-pre-wrap">{selectedPrinciple.fullText || selectedPrinciple.chapterText || '—'}</p>
                      )}
                      {focus === 'take-home' && <p className="whitespace-pre-wrap">{selectedPrinciple.takeHomeValue || '—'}</p>}
                      {focus === 'questions' && (
                        <div className="space-y-2">
                          {(selectedPrinciple.hardQuestions || []).length > 0 ? (
                            (selectedPrinciple.hardQuestions || []).map((q: string, idx: number) => (
                              <div key={idx} className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                                <div className="font-semibold text-gray-900">
                                  {idx + 1}. {q}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-700">—</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {!(canReveal && revealContent) && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="px-4 py-2 rounded-xl bg-black/60 text-white text-sm font-semibold backdrop-blur-md border border-white/20">
                        {canReveal ? 'Click “Click to reveal” to view content' : 'Content blurred for this role'}
                      </div>
                    </div>
                  )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-700">No principle selected.</div>
            )}
          </div>
        </div>

        {/* Related */}
        <div className="rounded-2xl bg-white/75 border border-white/40 backdrop-blur-md shadow-md p-5">
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Related to this section</div>
          <div className="mt-1 text-sm text-gray-600">
            We match by shared keywords in the selected section.
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <FiFilm className="text-primary-600" />
                Videos
              </div>
              {onGoToVideos && (
                <button
                  type="button"
                  onClick={onGoToVideos}
                  className="text-sm font-semibold text-primary-700 hover:text-primary-900"
                >
                  Open Videos
                </button>
              )}
            </div>
            <div className="mt-2 space-y-2">
              {relatedVideos.length === 0 ? (
                <div className="text-sm text-gray-600">No strong matches yet. Try a different section.</div>
              ) : (
                relatedVideos.map(({ v, matched, score }) => (
                  <div key={v.id} className="p-3 rounded-2xl bg-white/70 border border-white/60">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{v.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {v.instructor ? `${v.instructor} • ` : ''}{v.category || 'Video'}
                        </div>
                      </div>
                      <div className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {(score * 100).toFixed(0)}%
                      </div>
                    </div>
                    {matched.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {matched.map((k) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-[11px] font-semibold"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <FiCalendar className="text-primary-600" />
                Upcoming sessions
              </div>
              {onGoToSessions && (
                <button
                  type="button"
                  onClick={onGoToSessions}
                  className="text-sm font-semibold text-primary-700 hover:text-primary-900"
                >
                  Open Sessions
                </button>
              )}
            </div>
            <div className="mt-2 space-y-2">
              {relatedSessions.length === 0 ? (
                <div className="text-sm text-gray-600">No strong matches yet. Try a different section.</div>
              ) : (
                relatedSessions.map(({ s, matched, score }) => (
                  <div key={s.id} className="p-3 rounded-2xl bg-white/70 border border-white/60">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{s.title}</div>
                        <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                          <span>{s.instructor || 'Instructor'}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <FiClock />
                            {s.duration ? `${s.duration}m` : '—'}
                          </span>
                        </div>
                        {s.date && (
                          <div className="text-xs text-gray-600 mt-1">
                            {new Date(s.date).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {(score * 100).toFixed(0)}%
                      </div>
                    </div>
                    {matched.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {matched.map((k) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-[11px] font-semibold"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Approved annotations (only visible in Advanced Reader tool) */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <FiMessageSquare className="text-primary-600" />
                Community annotations
              </div>
              <div className="text-xs text-gray-600">
                {approvedAnnotations.length} approved
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {approvedAnnotations.length === 0 ? (
                <div className="text-sm text-gray-600">No approved annotations yet.</div>
              ) : (
                approvedAnnotations.slice(0, 6).map((a: PrincipleAnnotation) => (
                  <div key={a.id} className="p-3 rounded-2xl bg-white/70 border border-white/60">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                          {a.section.replace('-', ' ')} • {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-900 font-semibold mt-1">{a.createdByName}</div>
                        <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{a.text}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 text-xs text-gray-600">
            Want tighter matches? Add richer metadata to videos/sessions (topics, tags, linked principle IDs).
          </div>
        </div>
      </div>

      {/* Annotation modal */}
      {showAnnotate && selectedPrinciple && (
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
                    This will be submitted for review and may appear here after approval.
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
                    value={focusSection}
                    disabled
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700"
                  >
                    <option value={focusSection}>
                      {focusSection.replace('-', ' ')} (current)
                    </option>
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
                      const text = annotationText.trim()
                      if (!text) {
                        alert('Please write a comment before submitting.')
                        return
                      }
                      addAnnotation({
                        principleId: Number(selectedPrinciple.id),
                        principleTitle: String(selectedPrinciple.title || ''),
                        section: focusSection,
                        text,
                        createdById: Number(user?.id || 0),
                        createdByName: String(user?.name || ''),
                        createdByRole: String(user?.role || ''),
                      })
                      setAnnotationText('')
                      setShowAnnotate(false)
                      setAnnotationsVersion((v) => v + 1)
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

