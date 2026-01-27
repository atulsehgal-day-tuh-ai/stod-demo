import { normalizeRole } from '@/lib/roles'

export type DemoUser = {
  id: number
  username: string
  name: string
  role: string
  email?: string
  status?: string
  credits?: number
  walletStatus?: string
  createdAt?: string
}

export const DEMO_USERS_6: DemoUser[] = [
  {
    id: 1,
    username: 'admin',
    name: 'System Admin',
    role: 'Admin',
    email: 'admin@stod.com',
    status: 'Active',
    credits: 999999,
    walletStatus: 'Infinite',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    username: 'moderator',
    name: 'Sarah Moderator',
    role: 'Moderator',
    email: 'curator@stod.com',
    status: 'Active',
    credits: 5000,
    walletStatus: 'Stakeholder',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    username: 'subscriber1',
    name: 'Sam Subscriber 1',
    role: 'Subscriber',
    email: 'subscriber1@stod.com',
    status: 'Active',
    credits: 2500,
    walletStatus: 'Rechargeable',
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    username: 'subscriber2',
    name: 'Sid Subscriber 2',
    role: 'Subscriber',
    email: 'subscriber2@stod.com',
    status: 'Active',
    credits: 2500,
    walletStatus: 'Rechargeable',
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    username: 'subscriber3',
    name: 'Sana Subscriber 3',
    role: 'Subscriber',
    email: 'subscriber3@stod.com',
    status: 'Active',
    credits: 2500,
    walletStatus: 'Rechargeable',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    username: 'non',
    name: 'Nina Non-subscriber',
    role: 'Non-subscriber',
    email: 'nonsubscriber@stod.com',
    status: 'Active',
    credits: 50,
    walletStatus: 'Starter',
    createdAt: new Date().toISOString(),
  },
]

function looksLikeOldRoleModel(users: any[]): boolean {
  const roles = new Set(users.map((u) => String(u?.role || '')))
  return roles.has('Administrator') || roles.has('Manager') || roles.has('Editor') || roles.has('Viewer')
}

function looksLikeNewRoleModel(users: any[]): boolean {
  // If any user normalizes cleanly to one of the 4 roles, we consider it new.
  // (We still avoid overwriting and only normalize if needed.)
  return users.some((u) => {
    const r = normalizeRole(u?.role)
    return r === 'Admin' || r === 'Moderator' || r === 'Subscriber' || r === 'Non-subscriber'
  })
}

export function ensureSeedStodUsers() {
  try {
    const raw = localStorage.getItem('stod_users')
    const parsed = raw ? JSON.parse(raw) : null
    const list = Array.isArray(parsed) ? parsed : []

    if (!raw || list.length === 0) {
      localStorage.setItem('stod_users', JSON.stringify(DEMO_USERS_6))
      return
    }

    if (looksLikeOldRoleModel(list)) {
      localStorage.setItem('stod_users', JSON.stringify(DEMO_USERS_6))
      return
    }

    if (looksLikeNewRoleModel(list)) {
      // Normalize roles in-place only if necessary; do not overwrite custom users.
      let changed = false
      const next = list.map((u: any) => {
        const nr = normalizeRole(u?.role)
        if (u?.role !== nr) changed = true
        return { ...u, role: nr }
      })
      if (changed) localStorage.setItem('stod_users', JSON.stringify(next))
      return
    }
  } catch {
    // If corrupted, reset to demo set.
    try {
      localStorage.setItem('stod_users', JSON.stringify(DEMO_USERS_6))
    } catch {
      // ignore
    }
  }
}

