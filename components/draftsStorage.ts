'use client'

import { addNotification } from './notificationsStorage'

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

export type DraftVersion = {
  id: number
  at: string
  actorId: number
  actorName: string
  summary: string
  fields: DraftFields
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
  comments?: SuggestionComment[]
  reviewedAt?: string
  reviewedById?: number
  reviewedByName?: string
  reviewNotes?: string
  appliedAt?: string
  appliedById?: number
  appliedByName?: string
}

export type SuggestionComment = {
  id: number
  at: string
  authorId: number
  authorName: string
  body: string
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
      type: 'StageTransition'
      at: string
      actorId: number
      actorName: string
      summary: string
      fromStatus: DraftStatus
      toStatus: DraftStatus
    }
  | {
      id: number
      type: 'SuggestionCreated' | 'SuggestionReviewed' | 'SuggestionApplied' | 'SuggestionDeclined' | 'SuggestionCommented'
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
  watchers?: number[] // userIds who watch this draft for notifications
  versions?: DraftVersion[]

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

function titleForDraft(d: DraftPrinciple | null | undefined): string {
  return d?.fields?.title ? String(d.fields.title) : 'Untitled draft'
}

function uniqueNumbers(list: number[]): number[] {
  const out: number[] = []
  const seen = new Set<number>()
  for (const x of list) {
    const n = Number(x)
    if (!Number.isFinite(n) || n <= 0) continue
    if (seen.has(n)) continue
    seen.add(n)
    out.push(n)
  }
  return out
}

function notifyUsers(userIds: number[], input: { kind: any; at?: string; draft?: DraftPrinciple | null; actor?: { id: number; name: string }; message: string }) {
  const ids = uniqueNumbers(userIds)
  for (const uid of ids) {
    addNotification(uid, {
      kind: input.kind,
      at: input.at || new Date().toISOString(),
      draftId: input.draft?.id,
      draftTitle: input.draft ? titleForDraft(input.draft) : undefined,
      actorId: input.actor?.id,
      actorName: input.actor?.name,
      message: input.message,
    })
  }
}

function watchersForDraft(d: DraftPrinciple): number[] {
  const base = Array.isArray(d.watchers) ? d.watchers : []
  const mustInclude = [Number(d.ownerId)]
  return uniqueNumbers([...base, ...mustInclude])
}

function dedupeActivity(entries: ActivityLogEntry[]): ActivityLogEntry[] {
  const seen = new Set<string>()
  const out: ActivityLogEntry[] = []
  for (const e of entries) {
    const k =
      e.type === 'OwnerEdit'
        ? `${e.type}:${e.at}:${e.actorId}:${e.changedFields.join(',')}:${e.summary}`
        : e.type === 'StageTransition'
          ? `${e.type}:${e.at}:${e.actorId}:${e.fromStatus}:${e.toStatus}:${e.summary}`
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
    watchers: Array.isArray(base?.watchers) ? base.watchers.map(toNumber).filter((n: number) => n) : [],
    versions: Array.isArray(base?.versions) ? (base.versions as any) : [],
    archivedAt: base?.archivedAt ? String(base.archivedAt) : undefined,
    createdAt: String(base?.createdAt || now),
    updatedAt: String(base?.updatedAt || now),
  }

  // Ensure owner has access
  if (draft.ownerId && !draft.collaborators.includes(draft.ownerId)) draft.collaborators.unshift(draft.ownerId)
  // Ensure owner watches by default
  if (draft.ownerId) {
    const w = watchersForDraft(draft)
    draft.watchers = w
  }
  // Ensure versions exists (minimum initial snapshot)
  if (!Array.isArray(draft.versions) || draft.versions.length === 0) {
    draft.versions = [
      {
        id: makeId(),
        at: String(draft.createdAt || now),
        actorId: Number(draft.ownerId),
        actorName: String(draft.ownerName || 'Owner'),
        summary: 'Initial draft',
        fields: draft.fields,
      },
    ]
  }

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
    watchers: [Number(owner.id)],
    versions: [
      {
        id: makeId(),
        at: now,
        actorId: Number(owner.id),
        actorName: String(owner.name || 'Owner'),
        summary: 'Initial draft',
        fields: {
          title: fields?.title || '',
          category: fields?.category || '',
          description: fields?.description || '',
          takeHomeValue: fields?.takeHomeValue || '',
          fullText: fields?.fullText || '',
          hardQuestions: Array.isArray(fields?.hardQuestions) ? fields!.hardQuestions : [],
        },
      },
    ],
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
  const next = updateDraft(draftId, { accessRequests: [...d.accessRequests, userId] })
  if (next) {
    notifyUsers([Number(d.ownerId)], {
      kind: 'AccessRequested',
      draft: next,
      actor: { id: Number(userId), name: `User ${userId}` },
      message: `Access requested for “${titleForDraft(next)}”.`,
    })
  }
  return next
}

export function inviteCollaborator(draftId: number, userId: number) {
  const d = getDraftById(draftId)
  if (!d) return null
  if (d.collaborators.includes(userId)) return d
  if (d.invites.includes(userId)) return d
  const next = updateDraft(draftId, { invites: [...d.invites, userId] })
  if (next) {
    notifyUsers([Number(userId)], {
      kind: 'InviteReceived',
      draft: next,
      actor: { id: Number(d.ownerId), name: String(d.ownerName || 'Owner') },
      message: `You were invited to collaborate on “${titleForDraft(next)}”.`,
    })
  }
  return next
}

export function revokeInvite(draftId: number, userId: number) {
  const d = getDraftById(draftId)
  if (!d) return null
  const next = updateDraft(draftId, { invites: d.invites.filter((id) => id !== userId) })
  if (next) {
    notifyUsers([Number(userId)], {
      kind: 'InviteRevoked',
      draft: next,
      actor: { id: Number(d.ownerId), name: String(d.ownerName || 'Owner') },
      message: `Your invite was revoked for “${titleForDraft(next)}”.`,
    })
  }
  return next
}

export function approveAccessRequest(draftId: number, userId: number, actor?: { id: number; name: string }) {
  const d = getDraftById(draftId)
  if (!d) return null
  const nextCollaborators = Array.from(new Set([...d.collaborators, userId]))
  const next = updateDraft(draftId, {
    collaborators: nextCollaborators,
    invites: d.invites.filter((id) => id !== userId),
    accessRequests: d.accessRequests.filter((id) => id !== userId),
    watchers: uniqueNumbers([...(Array.isArray(d.watchers) ? d.watchers : []), Number(d.ownerId), Number(userId)]),
  })
  if (next) {
    // If actor is the invited user accepting, notify owner; otherwise notify the user that access was approved.
    if (actor && Number(actor.id) === Number(userId)) {
      notifyUsers([Number(d.ownerId)], {
        kind: 'AccessApproved',
        draft: next,
        actor,
        message: `${String(actor.name || 'A collaborator')} accepted the invite for “${titleForDraft(next)}”.`,
      })
    } else {
      notifyUsers([Number(userId)], {
        kind: 'AccessApproved',
        draft: next,
        actor: { id: Number(d.ownerId), name: String(d.ownerName || 'Owner') },
        message: `You now have access to collaborate on “${titleForDraft(next)}”.`,
      })
    }
  }
  return next
}

export function denyAccessRequest(draftId: number, userId: number, actor?: { id: number; name: string }) {
  const d = getDraftById(draftId)
  if (!d) return null
  const next = updateDraft(draftId, { accessRequests: d.accessRequests.filter((id) => id !== userId) })
  if (next) {
    notifyUsers([Number(userId)], {
      kind: 'AccessDenied',
      draft: next,
      actor: actor || { id: Number(d.ownerId), name: String(d.ownerName || 'Owner') },
      message: `Access request denied for “${titleForDraft(next)}”.`,
    })
  }
  return next
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
    comments: [],
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
  const next = updateDraft(input.draftId, { suggestions: [s, ...d.suggestions], activityLog: [activity, ...(d.activityLog || [])] })
  if (next) {
    const watchers = watchersForDraft(next).filter((id) => Number(id) !== Number(s.authorId))
    notifyUsers(watchers, {
      kind: 'SuggestionCreated',
      draft: next,
      actor: { id: Number(s.authorId), name: String(s.authorName || 'Collaborator') },
      message: `New suggestion on ${String((s.patch as any)?.field || 'field')}.`,
    })
  }
  return next
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

  const nextVersion: DraftVersion = {
    id: makeId(),
    at: now,
    actorId: Number(appliedBy.id),
    actorName: String(appliedBy.name || 'Owner'),
    summary,
    fields: nextFields,
  }

  const next = updateDraft(draftId, {
    fields: nextFields,
    suggestions: nextSuggestions,
    activityLog: [appliedEntry, reviewEntry, ...(d.activityLog || [])],
    versions: [nextVersion, ...((d.versions || []) as any)],
  })

  if (next) {
    const watchers = watchersForDraft(next).filter((id) => Number(id) !== Number(appliedBy.id))
    // Notify suggestion author and watchers.
    notifyUsers(uniqueNumbers([Number(s.authorId), ...watchers]), {
      kind: 'SuggestionApplied',
      draft: next,
      actor: { id: Number(appliedBy.id), name: String(appliedBy.name || 'Owner') },
      message: summary,
    })
  }

  return next
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

  const next = updateDraft(draftId, { suggestions: nextSuggestions, activityLog: [declinedEntry, reviewEntry, ...(d.activityLog || [])] })
  if (next) {
    const watchers = watchersForDraft(next).filter((id) => Number(id) !== Number(declinedBy.id))
    notifyUsers(uniqueNumbers([Number(s.authorId), ...watchers]), {
      kind: 'SuggestionDeclined',
      draft: next,
      actor: { id: Number(declinedBy.id), name: String(declinedBy.name || 'Owner') },
      message: `Declined: ${String((s.patch as any)?.field || 'field')} (from ${s.authorName})`,
    })
  }
  return next
}

export function submitDraftForModeratorReview(draftId: number, actor?: { id: number; name: string }) {
  const d = getDraftById(draftId)
  if (!d) return null
  const next = updateDraft(draftId, { status: 'SubmittedForReview' })
  if (!next) return next

  const effectiveActor = actor || { id: Number(d.ownerId), name: String(d.ownerName || 'Owner') }
  if (Number(effectiveActor.id) !== Number(d.ownerId)) return next

  const now = new Date().toISOString()
  const entry: ActivityLogEntry = {
    id: makeId(),
    type: 'StageTransition',
    at: now,
    actorId: Number(effectiveActor.id),
    actorName: String(effectiveActor.name || 'Owner'),
    summary: `Stage changed: ${d.status} → SubmittedForReview`,
    fromStatus: d.status,
    toStatus: 'SubmittedForReview',
  }

  const updated = updateDraft(draftId, { activityLog: [entry, ...(d.activityLog || [])] })
  if (updated) {
    const watchers = watchersForDraft(updated).filter((id) => Number(id) !== Number(effectiveActor.id))
    notifyUsers(watchers, {
      kind: 'DraftSubmitted',
      draft: updated,
      actor: { id: Number(effectiveActor.id), name: String(effectiveActor.name || 'Owner') },
      message: `Draft submitted for Moderator review.`,
    })
  }
  return updated
}

export function promoteDraftStatus(input: {
  draftId: number
  actor: { id: number; name: string }
  toStatus: DraftStatus
}) {
  const d = getDraftById(input.draftId)
  if (!d) return null
  if (Number(input.actor.id) !== Number(d.ownerId)) return d
  if (String(d.status) === 'SubmittedForReview') return d
  if (String(d.status) === 'Archived') return d

  const from = d.status
  const to = input.toStatus
  if (from === to) return d

  const now = new Date().toISOString()
  const entry: ActivityLogEntry = {
    id: makeId(),
    type: 'StageTransition',
    at: now,
    actorId: Number(input.actor.id),
    actorName: String(input.actor.name || 'Owner'),
    summary: `Stage changed: ${from} → ${to}`,
    fromStatus: from,
    toStatus: to,
  }

  const next = updateDraft(input.draftId, { status: to, activityLog: [entry, ...(d.activityLog || [])] })
  if (next) {
    const watchers = watchersForDraft(next).filter((id) => Number(id) !== Number(input.actor.id))
    notifyUsers(watchers, {
      kind: 'StageTransition',
      draft: next,
      actor: input.actor,
      message: `Stage changed: ${from} → ${to}`,
    })
  }
  return next
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

    const version: DraftVersion = {
      id: makeId(),
      at: now,
      actorId: Number(input.owner.id),
      actorName: String(input.owner.name || 'Owner'),
      summary: `Owner edited: ${changed.join(', ')}`,
      fields: input.nextFields,
    }
    nextDraftPatch.versions = [version, ...((d.versions || []) as any)]
  }

  const next = updateDraft(input.draftId, nextDraftPatch)
  if (next && changed.length > 0) {
    const watchers = watchersForDraft(next).filter((id) => Number(id) !== Number(input.owner.id))
    notifyUsers(watchers, {
      kind: 'OwnerEdit',
      draft: next,
      actor: input.owner,
      message: `Owner edited: ${changed.join(', ')}`,
    })
  }
  return next
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

export function toggleWatchDraft(draftId: number, userId: number) {
  const d = getDraftById(draftId)
  if (!d) return null
  const watchers = watchersForDraft(d)
  const uid = Number(userId)
  const nextWatchers = watchers.includes(uid) ? watchers.filter((x) => Number(x) !== uid) : uniqueNumbers([uid, ...watchers])
  return updateDraft(draftId, { watchers: nextWatchers })
}

export function addSuggestionComment(input: { draftId: number; suggestionId: number; authorId: number; authorName: string; body: string }) {
  const d = getDraftById(input.draftId)
  if (!d) return null
  if (!d.collaborators.includes(Number(input.authorId))) return d
  const s = d.suggestions.find((x) => x.id === input.suggestionId)
  if (!s) return d

  const now = new Date().toISOString()
  const comment: SuggestionComment = {
    id: makeId(),
    at: now,
    authorId: Number(input.authorId),
    authorName: String(input.authorName || ''),
    body: String(input.body || '').trim(),
  }
  if (!comment.body) return d

  const nextSuggestions = d.suggestions.map((x) =>
    x.id === input.suggestionId ? { ...x, comments: [comment, ...(Array.isArray(x.comments) ? x.comments : [])] } : x
  )

  const activity: ActivityLogEntry = {
    id: makeId(),
    type: 'SuggestionCommented',
    at: now,
    actorId: Number(comment.authorId),
    actorName: String(comment.authorName || 'Collaborator'),
    summary: `Commented on suggestion: ${String((s.patch as any)?.field || 'field')}`,
    suggestionId: Number(input.suggestionId),
  }

  const next = updateDraft(input.draftId, { suggestions: nextSuggestions, activityLog: [activity, ...(d.activityLog || [])] })
  if (next) {
    const watchers = watchersForDraft(next).filter((id) => Number(id) !== Number(comment.authorId))
    notifyUsers(watchers, {
      kind: 'SuggestionCommented',
      draft: next,
      actor: { id: Number(comment.authorId), name: String(comment.authorName || 'Collaborator') },
      message: `New comment on suggestion ${String((s.patch as any)?.field || 'field')}.`,
    })
  }
  return next
}

export function restoreDraftVersion(input: { draftId: number; owner: { id: number; name: string }; versionId: number }) {
  const d = getDraftById(input.draftId)
  if (!d) return null
  if (Number(input.owner.id) !== Number(d.ownerId)) return d
  if (String(d.status) === 'SubmittedForReview') return d

  const versions = Array.isArray(d.versions) ? d.versions : []
  const v = versions.find((x) => Number((x as any).id) === Number(input.versionId)) as any
  if (!v?.fields) return d

  const nextFields = v.fields as DraftFields
  const now = new Date().toISOString()
  const entry: ActivityLogEntry = {
    id: makeId(),
    type: 'OwnerEdit',
    at: now,
    actorId: Number(input.owner.id),
    actorName: String(input.owner.name || 'Owner'),
    summary: `Owner restored a previous version: ${String(v.summary || '')}`.trim(),
    changedFields: ['title', 'category', 'description', 'takeHomeValue', 'fullText', 'hardQuestions'],
  }
  const nextVersion: DraftVersion = {
    id: makeId(),
    at: now,
    actorId: Number(input.owner.id),
    actorName: String(input.owner.name || 'Owner'),
    summary: `Restored: ${String(v.summary || 'Previous version')}`,
    fields: nextFields,
  }

  const next = updateDraft(input.draftId, {
    fields: nextFields,
    lastOwnerSnapshot: nextFields,
    activityLog: [entry, ...(d.activityLog || [])],
    versions: [nextVersion, ...versions],
  })

  if (next) {
    const watchers = watchersForDraft(next).filter((id) => Number(id) !== Number(input.owner.id))
    notifyUsers(watchers, {
      kind: 'OwnerEdit',
      draft: next,
      actor: input.owner,
      message: `Owner restored a previous version.`,
    })
  }

  return next
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
