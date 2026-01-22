'use client'

export type AnnotationStatus = 'Pending Review' | 'Approved' | 'Rejected'
export type AnnotationSection = 'overview' | 'full' | 'take-home' | 'questions' | 'general'

export type PrincipleAnnotation = {
  id: number
  principleId: number
  principleTitle: string
  section: AnnotationSection
  text: string
  createdById: number
  createdByName: string
  createdByRole: string
  createdAt: string
  status: AnnotationStatus
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
}

const LS_KEY = 'stod_principle_annotations'

export function loadAnnotations(): PrincipleAnnotation[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function saveAnnotations(items: PrincipleAnnotation[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

export function addAnnotation(input: Omit<PrincipleAnnotation, 'id' | 'createdAt' | 'status'>) {
  const items = loadAnnotations()
  const a: PrincipleAnnotation = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    status: 'Pending Review',
    ...input,
  }
  items.unshift(a)
  saveAnnotations(items)
  return a
}

export function updateAnnotation(id: number, patch: Partial<PrincipleAnnotation>) {
  const items = loadAnnotations()
  const next = items.map((a) => (a.id === id ? { ...a, ...patch } : a))
  saveAnnotations(next)
  return next
}

