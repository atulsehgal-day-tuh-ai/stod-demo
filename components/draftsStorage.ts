'use client'

export type DraftStatus = 'Draft' | 'Collaborating' | 'ReadyToSubmit' | 'SubmittedForReview' | 'Archived'

export type DraftFieldKey = 'title' | 'category' | 'description' | 'takeHomeValue' | 'fullText' | 'hardQuestions'

export type DraftFields = {
  title: string
  category: string
  description: string
  takeHomeValue: string
  fullText: string
  hardQuestions: string[]
}

export type SuggestionStatus = 'Open' | 'Applied' | 'Declined'

export type SuggestionPatch =
  | { field: 'title'; value: string }
  | { field: 'category'; value: string }
  | { field: 'description'; value: string }
  | { field: 'takeHomeValue'; value: string }
  | { field: 'fullText'; value: string }
  | { field: 'hardQuestions'; value: string[] }

export type DraftSuggestion = {
  id: number
  draftId: number
  status: SuggestionStatus
  message?: string
  patch: SuggestionPatch
  authorId: number
  authorName: string
  createdAt: string
  reviewedAt?: string
  reviewedById?: number
  reviewedByName?: string
  reviewNotes?: string
  appliedAt?: string
  appliedById?: number
  appliedByName?: string
}

export type ActivityLogEntry =
  | {
      id: number
      type: 'OwnerEdit'
      at: string
      actorId: number
      actorName: string
      summary: string
      changedFields: DraftFieldKey[]
    }
  | {
      id: number
      type: 'SuggestionCreated' | 'SuggestionReviewed' | 'SuggestionApplied' | 'SuggestionDeclined'
      at: string
      actorId: number
      actorName: string
      summary: string
      suggestionId: number
    }

export type DraftPrinciple = {
  id: number
  status: DraftStatus
  isOpenToCollaborators?: boolean
  collaborateVisited?: boolean // legacy (no longer used)

  ownerId: number
  ownerName: string

  fields: DraftFields
  lastOwnerSnapshot?: DraftFields

  collaborators: number[] // userIds with access
  invites: number[] // userIds invited by owner
  accessRequests: number[] // userIds requesting access

  suggestions: DraftSuggestion[]
  activityLog: ActivityLogEntry[]

  archivedAt?: string

  createdAt: string
  updatedAt: string
}

const LS_KEY = 'stod_principle_drafts'

function toNumber(x: any): number {
  const n = Number(x)
  return Number.isFinite(n) ? n : 0
}

function makeId(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

function dedupeActivity(entries: ActivityLogEntry[]): ActivityLogEntry[] {
  const seen = new Set<string>()
  const out: ActivityLogEntry[] = []
  for (const e of entries) {
    const k =
      e.type === 'OwnerEdit'
        ? `${e.type}:${e.at}:${e.actorId}:${e.changedFields.join(',')}:${e.summary}`
        : `${e.type}:${e.at}:${e.actorId}:${e.suggestionId}:${e.summary}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push(e)
  }
  return out
}

function migrateDraft(raw: any): DraftPrinciple | null {
  if (!raw || typeof raw !== 'object') return null

  const base: any = raw
  const now = new Date().toISOString()

  const fields: DraftFields = {
    title: String(base?.fields?.title || ''),
    category: String(base?.fields?.category || ''),
    description: String(base?.fields?.description || ''),
    takeHomeValue: String(base?.fields?.takeHomeValue || ''),
    fullText: String(base?.fields?.fullText || ''),
    hardQuestions: Array.isArray(base?.fields?.hardQuestions) ? base.fields.hardQuestions.map((x: any) => String(x || '')) : [],
  }

  // Legacy -> new suggestions
  const legacyPullRequests: any[] = Array.isArray(base?.pullRequests) ? base.pullRequests : []
  const alreadySuggestions: any[] = Array.isArray(base?.suggestions) ? base.suggestions : []
  const sourceSuggestions = alreadySuggestions.length > 0 ? alreadySuggestions : legacyPullRequests

  const suggestions: DraftSuggestion[] = sourceSuggestions.map((pr: any) => {
    const legacyStatus = String(pr?.status || 'Open')
    const status: SuggestionStatus =
      legacyStatus === 'Merged' || legacyStatus === 'Applied'
        ? 'Applied'
        : legacyStatus === 'Closed' || legacyStatus === 'Declined'
          ? 'Declined'
          : 'Open'
    return {
      id: toNumber(pr?.id) || makeId(),
      draftId: toNumber(base?.id) || toNumber(pr?.draftId) || 0,
      status,
      message: pr?.message ? String(pr.message) : undefined,
      patch: pr?.patch as SuggestionPatch,
      authorId: toNumber(pr?.authorId),
      authorName: String(pr?.authorName || ''),
      createdAt: String(pr?.createdAt || now),
      reviewedAt: pr?.reviewedAt ? String(pr.reviewedAt) : undefined,
      reviewedById: pr?.reviewedById != null ? toNumber(pr.reviewedById) : undefined,
      reviewedByName: pr?.reviewedByName != null ? String(pr.reviewedByName) : undefined,
      reviewNotes: pr?.reviewNotes != null ? String(pr.reviewNotes) : undefined,
      appliedAt: pr?.appliedAt ? String(pr.appliedAt) : pr?.mergedAt ? String(pr.mergedAt) : undefined,
      appliedById: pr?.appliedById != null ? toNumber(pr.appliedById) : pr?.mergedById != null ? toNumber(pr.mergedById) : undefined,
      appliedByName:
        pr?.appliedByName != null ? String(pr.appliedByName) : pr?.mergedByName != null ? String(pr.mergedByName) : undefined,
    }
  })

  // Activity log: from new or legacy mergeLog + suggestion lifecycle
  const existingLog: any[] = Array.isArray(base?.activityLog) ? base.activityLog : []
  const legacyMergeLog: any[] = Array.isArray(base?.mergeLog) ? base.mergeLog : []

  const activityFromLegacyMerge: ActivityLogEntry[] = legacyMergeLog.map((m: any) => ({
    id: makeId(),
    type: 'SuggestionApplied',
    at: String(m?.mergedAt || now),
    actorId: toNumber(m?.mergedById),
    actorName: String(m?.mergedByName || 'Owner'),
    summary: String(m?.summary || 'Suggestion applied'),
    suggestionId: toNumber(m?.prId),
  }))

  const activityFromSuggestions: ActivityLogEntry[] = []
  for (const s of suggestions) {
    activityFromSuggestions.push({
      id: makeId(),
      type: 'SuggestionCreated',
      at: s.createdAt,
      actorId: toNumber(s.authorId),
      actorName: String(s.authorName || 'Collaborator'),
      summary: `Suggestion created: ${String((s.patch as any)?.field || 'field')}`,
      suggestionId: s.id,
    })
    if (s.reviewedAt && s.reviewedById != null) {
      activityFromSuggestions.push({
        id: makeId(),
        type: 'SuggestionReviewed',
        at: s.reviewedAt,
        actorId: toNumber(s.reviewedById),
        actorName: String(s.reviewedByName || 'Owner'),
        summary: 'Suggestion reviewed',
        suggestionId: s.id,
      })
    }
    if (s.status === 'Applied' && s.appliedAt && s.appliedById != null) {
      activityFromSuggestions.push({
        id: makeId(),
        type: 'SuggestionApplied',
        at: s.appliedAt,
        actorId: toNumber(s.appliedById),
        actorName: String(s.appliedByName || 'Owner'),
        summary: `Applied: ${String((s.patch as any)?.field || 'field')}`,
        suggestionId: s.id,
      })
    }
    if (s.status === 'Declined' && s.reviewedAt && s.reviewedById != null) {
      activityFromSuggestions.push({
        id: makeId(),
        type: 'SuggestionDeclined',
        at: s.reviewedAt,
        actorId: toNumber(s.reviewedById),
        actorName: String(s.reviewedByName || 'Owner'),
        summary: `Declined: ${String((s.patch as any)?.field || 'field')}`,
        suggestionId: s.id,
      })
    }
  }

  const activityLog: ActivityLogEntry[] = dedupeActivity([
    ...(existingLog as any),
    ...activityFromLegacyMerge,
    ...activityFromSuggestions,
  ])

  const draft: DraftPrinciple = {
    id: toNumber(base?.id) || makeId(),
    status: (base?.status as DraftStatus) || 'Draft',
    isOpenToCollaborators: !!base?.isOpenToCollaborators,
    ownerId: toNumber(base?.ownerId),
    ownerName: String(base?.ownerName || ''),
    fields,
    lastOwnerSnapshot: base?.lastOwnerSnapshot ? (base.lastOwnerSnapshot as DraftFields) : undefined,
    collaborators: Array.isArray(base?.collaborators) ? base.collaborators.map(toNumber).filter((n: number) => n) : [],
    invites: Array.isArray(base?.invites) ? base.invites.map(toNumber).filter((n: number) => n) : [],
    accessRequests: Array.isArray(base?.accessRequests) ? base.accessRequests.map(toNumber).filter((n: number) => n) : [],
    suggestions,
    activityLog,
    archivedAt: base?.archivedAt ? String(base.archivedAt) : undefined,
    createdAt: String(base?.createdAt || now),
    updatedAt: String(base?.updatedAt || now),
  }

  // Ensure owner has access
  if (draft.ownerId && !draft.collaborators.includes(draft.ownerId)) draft.collaborators.unshift(draft.ownerId)

  return draft
}

export function loadDrafts(): DraftPrinciple[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const data = raw ? JSON.parse(raw) : []
    const list = Array.isArray(data) ? data : []
    const migrated = list.map(migrateDraft).filter(Boolean) as DraftPrinciple[]
    // Persist migration if needed
    try {
      const needsPersist = list.some((d: any) => d && typeof d === 'object' && ('pullRequests' in d || 'mergeLog' in d))
      if (needsPersist) saveDrafts(migrated)
    } catch {
      // ignore
    }
    return migrated
  } catch {
    return []
  }
}

export function saveDrafts(items: DraftPrinciple[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

export function getDraftById(id: number): DraftPrinciple | null {
  return loadDrafts().find((d) => d.id === id) || null
}

export function createDraft(owner: { id: number; name: string }, fields?: Partial<DraftFields>) {
  const drafts = loadDrafts()
  const now = new Date().toISOString()
  const d: DraftPrinciple = {
    id: Date.now(),
    status: 'Draft',
    isOpenToCollaborators: false,
    collaborateVisited: false,
    ownerId: Number(owner.id),
    ownerName: String(owner.name || ''),
    fields: {
      title: fields?.title || '',
      category: fields?.category || '',
      description: fields?.description || '',
      takeHomeValue: fields?.takeHomeValue || '',
      fullText: fields?.fullText || '',
      hardQuestions: Array.isArray(fields?.hardQuestions) ? fields!.hardQuestions : [],
    },
    lastOwnerSnapshot: undefined,
    collaborators: [Number(owner.id)],
    invites: [],
    accessRequests: [],
    suggestions: [],
    activityLog: [],
    archivedAt: undefined,
    createdAt: now,
    updatedAt: now,
  }
  drafts.unshift(d)
  saveDrafts(drafts)
  return d
}

export function updateDraft(draftId: number, patch: Partial<DraftPrinciple>) {
  const drafts = loadDrafts()
  const next = drafts.map((d) => (d.id === draftId ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d))
  saveDrafts(next)
  return next.find((d) => d.id === draftId) || null
}

export function requestDraftAccess(draftId: number, userId: number) {
  const d = getDraftById(draftId)
  if (!d) return null
  if (d.collaborators.includes(userId)) return d
  if (d.accessRequests.includes(userId)) return d
  return updateDraft(draftId, { accessRequests: [...d.accessRequests, userId] })
}

export function inviteCollaborator(draftId: number, userId: number) {
  const d = getDraftById(draftId)
  if (!d) return null
  if (d.collaborators.includes(userId)) return d
  if (d.invites.includes(userId)) return d
  return updateDraft(draftId, { invites: [...d.invites, userId] })
}

export function revokeInvite(draftId: number, userId: number) {
  const d = getDraftById(draftId)
  if (!d) return null
  return updateDraft(draftId, { invites: d.invites.filter((id) => id !== userId) })
}

export function approveAccessRequest(draftId: number, userId: number) {
  const d = getDraftById(draftId)
  if (!d) return null
  const nextCollaborators = Array.from(new Set([...d.collaborators, userId]))
  return updateDraft(draftId, {
    collaborators: nextCollaborators,
    invites: d.invites.filter((id) => id !== userId),
    accessRequests: d.accessRequests.filter((id) => id !== userId),
  })
}

export function denyAccessRequest(draftId: number, userId: number) {
  const d = getDraftById(draftId)
  if (!d) return null
  return updateDraft(draftId, { accessRequests: d.accessRequests.filter((id) => id !== userId) })
}

export function createSuggestion(input: {
  draftId: number
  authorId: number
  authorName: string
  message?: string
  patch: SuggestionPatch
}) {
  const d = getDraftById(input.draftId)
  if (!d) return null
  // Guardrails: owners don't create suggestions; only collaborators with access can.
  if (Number(input.authorId) === Number(d.ownerId)) return d
  if (!d.collaborators.includes(Number(input.authorId))) return d
  const s: DraftSuggestion = {
    id: Date.now(),
    draftId: input.draftId,
    status: 'Open',
    message: input.message?.trim() || undefined,
    patch: input.patch,
    authorId: Number(input.authorId),
    authorName: String(input.authorName || ''),
    createdAt: new Date().toISOString(),
  }
  const createdAt = s.createdAt
  const activity: ActivityLogEntry = {
    id: makeId(),
    type: 'SuggestionCreated',
    at: createdAt,
    actorId: Number(s.authorId),
    actorName: String(s.authorName || 'Collaborator'),
    summary: `Suggestion created: ${String((s.patch as any)?.field || 'field')}`,
    suggestionId: Number(s.id),
  }
  return updateDraft(input.draftId, { suggestions: [s, ...d.suggestions], activityLog: [activity, ...(d.activityLog || [])] })
}

export function applySuggestion(
  draftId: number,
  suggestionId: number,
  appliedBy: { id: number; name: string },
  reviewNotes?: string
) {
  const d = getDraftById(draftId)
  if (!d) return null
  // Only the owner can apply suggestions.
  if (Number(appliedBy.id) !== Number(d.ownerId)) return d
  const s = d.suggestions.find((x) => x.id === suggestionId)
  if (!s || s.status !== 'Open') return d

  const now = new Date().toISOString()
  const nextFields = { ...d.fields } as DraftFields
  if (s.patch.field === 'hardQuestions') nextFields.hardQuestions = s.patch.value
  else (nextFields as any)[s.patch.field] = s.patch.value

  const nextSuggestions = d.suggestions.map((x) =>
    x.id === suggestionId
      ? {
          ...x,
          status: 'Applied' as const,
          reviewedAt: now,
          reviewedById: Number(appliedBy.id),
          reviewedByName: String(appliedBy.name || ''),
          reviewNotes: reviewNotes?.trim() || undefined,
          appliedAt: now,
          appliedById: Number(appliedBy.id),
          appliedByName: String(appliedBy.name || ''),
        }
      : x
  )

  const summary = `Applied: ${String((s.patch as any)?.field || 'field')} (from ${s.authorName})`
  const reviewEntry: ActivityLogEntry = {
    id: makeId(),
    type: 'SuggestionReviewed',
    at: now,
    actorId: Number(appliedBy.id),
    actorName: String(appliedBy.name || 'Owner'),
    summary: reviewNotes?.trim() ? `Reviewed: ${reviewNotes.trim()}` : 'Suggestion reviewed',
    suggestionId: Number(suggestionId),
  }
  const appliedEntry: ActivityLogEntry = {
    id: makeId(),
    type: 'SuggestionApplied',
    at: now,
    actorId: Number(appliedBy.id),
    actorName: String(appliedBy.name || 'Owner'),
    summary,
    suggestionId: Number(suggestionId),
  }

  return updateDraft(draftId, {
    fields: nextFields,
    suggestions: nextSuggestions,
    activityLog: [appliedEntry, reviewEntry, ...(d.activityLog || [])],
  })
}

export function declineSuggestion(
  draftId: number,
  suggestionId: number,
  declinedBy: { id: number; name: string },
  reviewNotes: string
) {
  const d = getDraftById(draftId)
  if (!d) return null
  // Only the owner can decline suggestions.
  if (Number(declinedBy.id) !== Number(d.ownerId)) return d
  const note = String(reviewNotes || '').trim()
  if (!note) return d // required

  const s = d.suggestions.find((x) => x.id === suggestionId)
  if (!s || s.status !== 'Open') return d

  const now = new Date().toISOString()
  const nextSuggestions = d.suggestions.map((x) =>
    x.id === suggestionId
      ? {
          ...x,
          status: 'Declined' as const,
          reviewedAt: now,
          reviewedById: Number(declinedBy.id),
          reviewedByName: String(declinedBy.name || ''),
          reviewNotes: note,
        }
      : x
  )

  const reviewEntry: ActivityLogEntry = {
    id: makeId(),
    type: 'SuggestionReviewed',
    at: now,
    actorId: Number(declinedBy.id),
    actorName: String(declinedBy.name || 'Owner'),
    summary: `Reviewed: ${note}`,
    suggestionId: Number(suggestionId),
  }
  const declinedEntry: ActivityLogEntry = {
    id: makeId(),
    type: 'SuggestionDeclined',
    at: now,
    actorId: Number(declinedBy.id),
    actorName: String(declinedBy.name || 'Owner'),
    summary: `Declined: ${String((s.patch as any)?.field || 'field')} (from ${s.authorName})`,
    suggestionId: Number(suggestionId),
  }

  return updateDraft(draftId, { suggestions: nextSuggestions, activityLog: [declinedEntry, reviewEntry, ...(d.activityLog || [])] })
}

export function submitDraftForModeratorReview(draftId: number) {
  const d = getDraftById(draftId)
  if (!d) return null
  return updateDraft(draftId, { status: 'SubmittedForReview' })
}

export function ownerUpdateDraftFields(input: {
  draftId: number
  owner: { id: number; name: string }
  nextFields: DraftFields
}) {
  const d = getDraftById(input.draftId)
  if (!d) return null
  if (Number(input.owner.id) !== Number(d.ownerId)) return d
  if (String(d.status) === 'SubmittedForReview') return d
  const prev = d.lastOwnerSnapshot || d.fields

  const changed: DraftFieldKey[] = []
  const keys: DraftFieldKey[] = ['title', 'category', 'description', 'takeHomeValue', 'fullText', 'hardQuestions']
  for (const k of keys) {
    const a = (prev as any)[k]
    const b = (input.nextFields as any)[k]
    const same = Array.isArray(a) || Array.isArray(b) ? JSON.stringify(a || []) === JSON.stringify(b || []) : String(a || '') === String(b || '')
    if (!same) changed.push(k)
  }

  const now = new Date().toISOString()
  const nextDraftPatch: Partial<DraftPrinciple> = {
    fields: input.nextFields,
    lastOwnerSnapshot: input.nextFields,
  }

  if (changed.length > 0) {
    const entry: ActivityLogEntry = {
      id: makeId(),
      type: 'OwnerEdit',
      at: now,
      actorId: Number(input.owner.id),
      actorName: String(input.owner.name || 'Owner'),
      summary: `Owner edited: ${changed.join(', ')}`,
      changedFields: changed,
    }
    nextDraftPatch.activityLog = [entry, ...(d.activityLog || [])]
  }

  return updateDraft(input.draftId, nextDraftPatch)
}

function isLockedForReview(d: DraftPrinciple): boolean {
  return String(d.status) === 'SubmittedForReview'
}

export function archiveDraft(draftId: number, actor: { id: number; name: string }) {
  const d = getDraftById(draftId)
  if (!d) return null
  if (Number(actor.id) !== Number(d.ownerId)) return d
  if (isLockedForReview(d)) return d
  if (String(d.status) === 'Archived') return d
  const now = new Date().toISOString()
  return updateDraft(draftId, { status: 'Archived', archivedAt: now })
}

export function restoreDraft(draftId: number, actor: { id: number; name: string }) {
  const d = getDraftById(draftId)
  if (!d) return null
  if (Number(actor.id) !== Number(d.ownerId)) return d
  if (isLockedForReview(d)) return d
  if (String(d.status) !== 'Archived') return d
  return updateDraft(draftId, { status: 'Draft', archivedAt: undefined })
}

export function deleteDraft(draftId: number, actor: { id: number; name: string }) {
  const d = getDraftById(draftId)
  if (!d) return null
  if (Number(actor.id) !== Number(d.ownerId)) return d
  if (isLockedForReview(d)) return d
  const drafts = loadDrafts()
  const next = drafts.filter((x) => x.id !== draftId)
  saveDrafts(next)
  return d
}
