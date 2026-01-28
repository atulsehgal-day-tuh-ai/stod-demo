'use client'

export type NotificationKind =
  | 'InviteReceived'
  | 'InviteRevoked'
  | 'AccessRequested'
  | 'AccessApproved'
  | 'AccessDenied'
  | 'SuggestionCreated'
  | 'SuggestionCommented'
  | 'SuggestionApplied'
  | 'SuggestionDeclined'
  | 'OwnerEdit'
  | 'StageTransition'
  | 'DraftSubmitted'

export type UserNotification = {
  id: number
  kind: NotificationKind
  at: string
  read: boolean
  userId: number
  draftId?: number
  draftTitle?: string
  actorId?: number
  actorName?: string
  message: string
}

const LS_KEY = 'stod_notifications_by_user'
const MAX_PER_USER = 200

function makeId() {
  return Date.now() + Math.floor(Math.random() * 1000)
}

function loadMap(): Record<string, UserNotification[]> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveMap(map: Record<string, UserNotification[]>) {
  localStorage.setItem(LS_KEY, JSON.stringify(map))
}

export function loadNotificationsForUser(userId: number): UserNotification[] {
  const map = loadMap()
  const list = map[String(userId)]
  return Array.isArray(list) ? list : []
}

export function getUnreadCount(userId: number): number {
  return loadNotificationsForUser(userId).filter((n) => !n.read).length
}

export function addNotification(userId: number, input: Omit<UserNotification, 'id' | 'read' | 'userId'>): UserNotification {
  const now = input.at || new Date().toISOString()
  const item: UserNotification = {
    id: makeId(),
    read: false,
    userId: Number(userId),
    ...input,
    at: now,
  }
  const map = loadMap()
  const key = String(userId)
  const prev = Array.isArray(map[key]) ? map[key] : []
  const next = [item, ...prev].slice(0, MAX_PER_USER)
  map[key] = next
  saveMap(map)
  return item
}

export function markNotificationRead(userId: number, notificationId: number) {
  const map = loadMap()
  const key = String(userId)
  const prev = Array.isArray(map[key]) ? map[key] : []
  map[key] = prev.map((n) => (Number(n.id) === Number(notificationId) ? { ...n, read: true } : n))
  saveMap(map)
}

export function markAllRead(userId: number) {
  const map = loadMap()
  const key = String(userId)
  const prev = Array.isArray(map[key]) ? map[key] : []
  map[key] = prev.map((n) => ({ ...n, read: true }))
  saveMap(map)
}

