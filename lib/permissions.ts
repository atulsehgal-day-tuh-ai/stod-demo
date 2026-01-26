import { normalizeRole, type AppRole } from '@/lib/roles'

function roleOf(input: unknown): AppRole {
  return normalizeRole(input)
}

export function canUseTools(role: unknown): boolean {
  const r = roleOf(role)
  return r !== 'Non-subscriber'
}

export function canSeeReview(role: unknown): boolean {
  const r = roleOf(role)
  return r === 'Moderator' || r === 'Admin'
}

export function canSeeUsers(role: unknown): boolean {
  const r = roleOf(role)
  return r === 'Admin'
}

export function canCollaborate(role: unknown): boolean {
  const r = roleOf(role)
  return r === 'Subscriber' || r === 'Moderator' || r === 'Admin'
}

export function getNonSubscriberAllowedFeaturedIds(principles: any[]): Set<number> {
  const featured = (Array.isArray(principles) ? principles : [])
    .filter((p) => !!p?.featured)
    .slice()
    .sort((a, b) => Number(a?.id) - Number(b?.id))
    .slice(0, 2)
    .map((p) => Number(p?.id))
    .filter((n) => Number.isFinite(n))
  return new Set(featured)
}

function isPublishedStatus(status: unknown) {
  const s = String(status || '')
  return s === 'Core Principles' || s === 'Published'
}

export function canOpenPrinciple(opts: {
  role: unknown
  user: any
  principle: any
  allowedFeaturedIds: Set<number>
}): boolean {
  const r = roleOf(opts.role)
  const p = opts.principle
  const pid = Number(p?.id)

  // Everyone else can open everything for now.
  if (r !== 'Non-subscriber') return true

  // Non-subscriber: allow up to 2 featured principles.
  if (Number.isFinite(pid) && opts.allowedFeaturedIds.has(pid)) return true

  // Non-subscriber: allow their own published principles.
  if (opts?.user?.id != null && Number(p?.createdById) === Number(opts.user.id) && isPublishedStatus(p?.status)) return true

  return false
}

