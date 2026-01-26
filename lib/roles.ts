export type AppRole = 'Non-subscriber' | 'Subscriber' | 'Moderator' | 'Admin'

/**
 * Back-compat mapping from legacy demo roles to the new 4-role model.
 * Phase 1 goal: don't break existing localStorage users after the role rename.
 */
export function normalizeRole(raw: unknown): AppRole {
  const r = String(raw || '').trim()

  // New roles (already normalized)
  if (r === 'Non-subscriber' || r === 'Subscriber' || r === 'Moderator' || r === 'Admin') return r

  // Legacy roles -> new roles
  if (r === 'Admin') return 'Admin'
  if (r === 'Moderator') return 'Moderator'
  if (r === 'Looker') return 'Non-subscriber'
  if (r === 'Member' || r === 'Practitioner' || r === 'Contributor') return 'Subscriber'

  // Fallback: treat unknown as Non-subscriber
  return 'Non-subscriber'
}

