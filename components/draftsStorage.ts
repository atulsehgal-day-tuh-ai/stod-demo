'use client'

export type DraftStatus = 'Draft' | 'Collaborating' | 'ReadyToSubmit' | 'SubmittedForReview'

export type DraftFieldKey = 'title' | 'category' | 'description' | 'takeHomeValue' | 'fullText' | 'hardQuestions'

export type DraftFields = {
  title: string
  category: string
  description: string
  takeHomeValue: string
  fullText: string
  hardQuestions: string[]
}

export type PullRequestStatus = 'Open' | 'Merged' | 'Closed'

export type PullRequestPatch =
  | { field: 'title'; value: string }
  | { field: 'category'; value: string }
  | { field: 'description'; value: string }
  | { field: 'takeHomeValue'; value: string }
  | { field: 'fullText'; value: string }
  | { field: 'hardQuestions'; value: string[] }

export type DraftPullRequest = {
  id: number
  draftId: number
  status: PullRequestStatus
  message?: string
  patch: PullRequestPatch
  authorId: number
  authorName: string
  createdAt: string
  mergedAt?: string
  mergedById?: number
  mergedByName?: string
}

export type DraftPrinciple = {
  id: number
  status: DraftStatus
  isOpenToCollaborators?: boolean

  ownerId: number
  ownerName: string

  fields: DraftFields

  collaborators: number[] // userIds with access
  invites: number[] // userIds invited by owner
  accessRequests: number[] // userIds requesting access

  pullRequests: DraftPullRequest[]
  mergeLog: Array<{
    prId: number
    mergedAt: string
    mergedById: number
    mergedByName: string
    summary: string
  }>

  createdAt: string
  updatedAt: string
}

const LS_KEY = 'stod_principle_drafts'

export function loadDrafts(): DraftPrinciple[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? (data as DraftPrinciple[]) : []
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
    collaborators: [Number(owner.id)],
    invites: [],
    accessRequests: [],
    pullRequests: [],
    mergeLog: [],
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

export function createPullRequest(input: {
  draftId: number
  authorId: number
  authorName: string
  message?: string
  patch: PullRequestPatch
}) {
  const d = getDraftById(input.draftId)
  if (!d) return null
  const pr: DraftPullRequest = {
    id: Date.now(),
    draftId: input.draftId,
    status: 'Open',
    message: input.message?.trim() || undefined,
    patch: input.patch,
    authorId: Number(input.authorId),
    authorName: String(input.authorName || ''),
    createdAt: new Date().toISOString(),
  }
  return updateDraft(input.draftId, { pullRequests: [pr, ...d.pullRequests] })
}

export function mergePullRequest(draftId: number, prId: number, mergedBy: { id: number; name: string }) {
  const d = getDraftById(draftId)
  if (!d) return null
  const pr = d.pullRequests.find((x) => x.id === prId)
  if (!pr || pr.status !== 'Open') return d

  const now = new Date().toISOString()
  const nextFields = { ...d.fields } as DraftFields
  if (pr.patch.field === 'hardQuestions') nextFields.hardQuestions = pr.patch.value
  else (nextFields as any)[pr.patch.field] = pr.patch.value

  const nextPrs = d.pullRequests.map((x) =>
    x.id === prId
      ? {
          ...x,
          status: 'Merged' as const,
          mergedAt: now,
          mergedById: Number(mergedBy.id),
          mergedByName: String(mergedBy.name || ''),
        }
      : x
  )

  const summary = `${pr.patch.field} updated by ${pr.authorName}`

  return updateDraft(draftId, {
    fields: nextFields,
    pullRequests: nextPrs,
    mergeLog: [
      { prId, mergedAt: now, mergedById: Number(mergedBy.id), mergedByName: String(mergedBy.name || ''), summary },
      ...d.mergeLog,
    ],
  })
}

export function closePullRequest(draftId: number, prId: number) {
  const d = getDraftById(draftId)
  if (!d) return null
  const nextPrs = d.pullRequests.map((x) => (x.id === prId ? { ...x, status: 'Closed' as const } : x))
  return updateDraft(draftId, { pullRequests: nextPrs })
}

export function submitDraftForModeratorReview(draftId: number) {
  const d = getDraftById(draftId)
  if (!d) return null
  return updateDraft(draftId, { status: 'SubmittedForReview' })
}

