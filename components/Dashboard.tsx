'use client'

import { useState, useEffect, useMemo } from 'react'
import { FiLogOut, FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiUser, FiBook, FiSave, FiUsers, FiMessageSquare, FiHelpCircle, FiUpload, FiCheckCircle, FiStar, FiZap, FiPlay, FiCalendar, FiDollarSign, FiLock } from 'react-icons/fi'
import PrincipleCard from './PrincipleCard'
import PrincipleModal from './PrincipleModal'
import UserManagement from './UserManagement'
import CreditsWallet from './CreditsWallet'
import PrincipleSubmission from './PrincipleSubmission'
import CuratorReview from './CuratorReview'
import Forums from './Forums'
import SavedPrinciples from './SavedPrinciples'
import DissonanceMatrix from './DissonanceMatrix'
import ToolsHub, { type ToolKey } from './ToolsHub'
import PrincipleMap from './PrincipleMap'
import AdvancedReader from './AdvancedReader'
import Videos from './Videos'
import Sessions from './Sessions'
import Collaborate from './Collaborate'
import { canCollaborate, canOpenPrinciple, canSeeReview, canSeeUsers, canUseTools, getNonSubscriberAllowedFeaturedIds } from '@/lib/permissions'

interface DashboardProps {
  user: any
  onLogout: () => void
  onUpdateUser?: (nextUser: any) => void
}

type ToolsSubscriptionPlan = 'monthly' | 'annual'
type ToolsSubscription = {
  plan: ToolsSubscriptionPlan
  startedAt: string
  expiresAt: string
}

const TOOLS_SUBSCRIPTION_LS_KEY = 'stod_tools_subscription_by_user'
const TOOLS_PRICING: Record<ToolsSubscriptionPlan, { label: string; credits: number; days: number }> = {
  monthly: { label: 'Monthly', credits: 250, days: 30 },
  annual: { label: 'Annual', credits: 2500, days: 365 },
}

function addDays(base: number, days: number) {
  return new Date(base + days * 24 * 60 * 60 * 1000).toISOString()
}

function loadToolsSubscription(userId: any): ToolsSubscription | null {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(TOOLS_SUBSCRIPTION_LS_KEY)
    const map = raw ? JSON.parse(raw) : {}
    const sub = map[String(userId)]
    if (!sub || !sub.expiresAt) return null
    return sub as ToolsSubscription
  } catch {
    return null
  }
}

function saveToolsSubscription(userId: any, sub: ToolsSubscription | null) {
  if (!userId) return
  try {
    const raw = localStorage.getItem(TOOLS_SUBSCRIPTION_LS_KEY)
    const map = raw ? JSON.parse(raw) : {}
    if (sub) map[String(userId)] = sub
    else delete map[String(userId)]
    localStorage.setItem(TOOLS_SUBSCRIPTION_LS_KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

function isSubscriptionActive(sub: ToolsSubscription | null) {
  if (!sub?.expiresAt) return false
  const ts = Date.parse(sub.expiresAt)
  return Number.isFinite(ts) && ts > Date.now()
}

export default function Dashboard({ user, onLogout, onUpdateUser }: DashboardProps) {
  const STOD_PRINCIPLES_SEED_VERSION = 'stod-v24-2026-01-22-fulltext-1'
  const AUTHOR_NAME_MAP: Record<string, string> = {
    // Current seed labels
    'Alex Contributor': 'Alex Rivera',
    'Sarah Moderator': 'Sarah Chen',

    // Legacy labels (older seed data)
    'Alex Architect': 'Alex Rivera',
    'Sarah Curator': 'Sarah Chen',

    // Older demo-era generic names that may exist in localStorage data
    'Admin User': 'Gary Kennedy',
    'Manager User': 'Jordan Patel',
    'Editor User': 'Morgan Lee',
    'Viewer User': 'Taylor Kim',
    'System Admin': 'Gary Kennedy',
  }

  const [principles, setPrinciples] = useState<any[]>([])
  const [filteredPrinciples, setFilteredPrinciples] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'relevance' | 'recency' | 'popularity' | 'title'>('relevance')
  const [authorFilter, setAuthorFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingPrinciple, setEditingPrinciple] = useState<any>(null)
  const [advancedReaderOpen, setAdvancedReaderOpen] = useState(false)
  const [advancedReaderInitialId, setAdvancedReaderInitialId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<
    'principles' | 'users' | 'submissions' | 'collaborate' | 'review' | 'forums' | 'saved' | 'matrix' | 'videos' | 'sessions' | 'credits'
  >('principles')
  const [proposeOpenDraftId, setProposeOpenDraftId] = useState<number | null>(null)
  const [activeTool, setActiveTool] = useState<ToolKey | null>(null)
  const [toolsSubscription, setToolsSubscription] = useState<ToolsSubscription | null>(null)
  const [pendingTool, setPendingTool] = useState<ToolKey | null>(null)

  // Phase 1 strategy: everyone gets access to everything.
  // (We’ll tighten permissions later capability-by-capability.)
  const canView = true
  const canSave = true
  const canCreate = true
  const canEdit = true
  const canDelete = true
  const canCurate = true
  const canManageUsers = true
  const canAccessForums = true
  const canSubmitPrinciples = true
  const canAccessMatrix = true
  const canAccessVideos = true

  const role = user?.role
  const allowTools = canUseTools(role)
  const allowReview = canSeeReview(role)
  const allowUsers = canSeeUsers(role)
  const allowCollaborate = canCollaborate(role)
  const allowedFeaturedIds = useMemo(() => getNonSubscriberAllowedFeaturedIds(principles), [principles])

  // Phase 1: tools content is open once you can access Tools at all.
  const toolsSubscribed = true

  useEffect(() => {
    if (!user?.id) return
    setToolsSubscription(loadToolsSubscription(user.id))
  }, [user?.id])

  const isPrincipleUnlocked = (_p: any) => true

  useEffect(() => {
    const stored = localStorage.getItem('stod_principles')
    const storedSeedVersion = localStorage.getItem('stod_principles_seed_version')

    const seedData = [
      {
        id: 1,
        title: 'Same Thing Only Different',
        category: 'Pattern Recognition',
        description:
          'To achieve different (better) results, keep what works and change what doesn’t—iterating, measuring, and adjusting. This protects past learning while enabling improvement.',
        fullText:
          'The logic train I followed to arrive at the “same thing only different” goes as follows.\n\n' +
          'In order to achieve different results it is requisite to do things differently. When you do things differently you will either achieve better results or lesser results.\n\n' +
          'Are you willing to take the risk of achieving lesser results in order to have an opportunity to achieve better results?\n\n' +
          'Do you see that making wholesale changes—i.e., change everything—fails to take advantage of the learning of the past?\n\n' +
          'Can you see that the only way to effect changes that lead to better results is by doing the “same thing only different?” In other words, continue the things that have worked well while you change, measure, adjust, and change again until you have delivered definitively different (better) results.\n\n' +
          'Determine what has worked well and continue that while changing some things so you can achieve different (better) results.',
        status: 'Core Principles',
        version: '24.0',
        createdBy: 'Gary Kennedy',
        createdById: 2,
        curatorName: 'Sarah Chen',
        curatorId: 2,
        featured: true,
        mostLiked: true,
        likes: 89,
        hardQuestions: [
          'What has worked well before that you should keep?',
          'What is “only different” this time—and how will you measure it?',
          'What small change would produce a definitively better outcome?',
        ],
        takeHomeValue: 'Keep the effective parts, change one variable, measure, adjust, repeat.',
        savedBy: [5, 4, 3, 2],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Pay Attention',
        category: 'Observation',
        description:
          'The obvious is often invisible until you slow down and notice. Consistent attention beats occasional brilliance.',
        status: 'Core Principles',
        version: '24.0',
        createdBy: 'Gary Kennedy',
        createdById: 2,
        curatorName: 'Sarah Chen',
        curatorId: 2,
        featured: true,
        likes: 67,
        hardQuestions: [
          'What is right in front of you that you’re ignoring?',
          'What pattern is repeating that you haven’t named yet?',
          'What would you notice if you watched the system—not the story?',
        ],
        takeHomeValue: 'Stop. Look. Listen. The answer is often already present.',
        savedBy: [5, 4],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Context Matters (Context is King)',
        category: 'Decision Making',
        description:
          'Before you act, understand the “why” and the environment. The same action can be correct or catastrophic depending on context.',
        fullText:
          'A very important principle is context matters—or “Context is king.”\n\n' +
          'When you evaluate an idea, a choice, or a claim, the surrounding context changes what it means and whether it is wise.\n\n' +
          'Consider the source. Context is king. Provenance matters.',
        status: 'Core Principles',
        version: '24.0',
        createdBy: 'Gary Kennedy',
        createdById: 2,
        curatorName: 'Sarah Chen',
        curatorId: 2,
        featured: true,
        likes: 54,
        hardQuestions: [
          'What problem are we actually solving (not just reacting to)?',
          'What context would change the “right” answer?',
          'What’s missing from the picture that would reverse your decision?',
        ],
        takeHomeValue: 'Get context first; execution without context creates expensive mistakes.',
        savedBy: [5],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 4,
        title: 'Build What You Can Sell',
        category: 'Entrepreneurship',
        description:
          'Choose the right filter. Instead of “sell what we can build,” prefer “build what we can sell.” Let demand guide decisions.',
        status: 'Core Principles',
        version: '24.0',
        createdBy: 'Jordan Patel',
        createdById: 4,
        curatorName: 'Sarah Chen',
        curatorId: 2,
        featured: true,
        likes: 61,
        hardQuestions: [
          'What filter are you using to choose features or products?',
          'Are you building for capability or for demand?',
          'What would customers pay for if you had to prove it this week?',
        ],
        takeHomeValue: 'Use a customer filter early; it prevents capability-first mistakes.',
        savedBy: [4, 3],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 5,
        title: 'Fix It, Then Decentralize',
        category: 'Leadership',
        description:
          'You can’t fix a broken organization by decentralizing it. Stabilize the core first, then distribute decision-making.',
        status: 'In Process',
        workflowStage: 'Under Review',
        currentAssignee: 'Sarah Chen',
        version: '24.0',
        createdBy: 'Gary Kennedy',
        createdById: 2,
        curatorId: 2,
        curatorName: 'Sarah Chen',
        likes: 47,
        hardQuestions: [
          'What’s broken that must be fixed before autonomy works?',
          'Where does decentralization increase chaos today?',
          'What is the minimum stable process before you delegate?',
        ],
        takeHomeValue: 'Stability precedes autonomy. Fix first, then decentralize.',
        savedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 6,
        title: 'Think “Manage”, Not “Solve”',
        category: 'Strategy',
        description:
          'Complex problems often can’t be “solved” once and for all. Manage with scenarios, feedback loops, and a guiding playbook of principles.',
        status: 'Core Principles',
        version: '24.0',
        createdBy: 'Morgan Lee',
        createdById: 5,
        curatorName: 'Sarah Chen',
        curatorId: 2,
        featured: false,
        likes: 38,
        hardQuestions: [
          'What would “managing” this look like vs “solving” it?',
          'What feedback loops will tell you early if you’re wrong?',
          'What principle will guide decisions when the plan changes?',
        ],
        takeHomeValue: 'Use principles as a playbook and adapt as new information appears.',
        savedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    if (stored) {
      // Only keep previously stored principles if they were seeded by the current STOD v24 seed.
      if (storedSeedVersion === STOD_PRINCIPLES_SEED_VERSION) {
        const data = JSON.parse(stored)
        const migrated = (Array.isArray(data) ? data : []).map((p: any) => ({
          ...p,
          createdBy: AUTHOR_NAME_MAP[String(p?.createdBy || '').trim()] || p?.createdBy,
          curatorName: AUTHOR_NAME_MAP[String(p?.curatorName || '').trim()] || p?.curatorName,
          currentAssignee: AUTHOR_NAME_MAP[String(p?.currentAssignee || '').trim()] || p?.currentAssignee,
        }))
        setPrinciples(migrated)
        setFilteredPrinciples(migrated)
        localStorage.setItem('stod_principles', JSON.stringify(migrated))
        return
      }
    }

    // Seed / reset to STOD v24 principles
    setPrinciples(seedData)
    setFilteredPrinciples(seedData)
    localStorage.setItem('stod_principles', JSON.stringify(seedData))
    localStorage.setItem('stod_principles_seed_version', STOD_PRINCIPLES_SEED_VERSION)
  }, [])

  const authorOptions = useMemo(() => {
    const authors = Array.from(new Set(principles.map((p) => p.createdBy).filter(Boolean)))
    authors.sort((a, b) => String(a).localeCompare(String(b)))
    return authors
  }, [principles])

  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(principles.map((p) => p.category).filter(Boolean)))
    cats.sort((a, b) => String(a).localeCompare(String(b)))
    return cats
  }, [principles])

  useEffect(() => {
    const q = searchTerm.trim().toLowerCase()

    const getDate = (p: any) => {
      const dt = p.updatedAt || p.createdAt
      const ts = dt ? Date.parse(dt) : 0
      return Number.isFinite(ts) ? ts : 0
    }

    const score = (p: any) => {
      if (!q) return 0
      const title = String(p.title || '').toLowerCase()
      const desc = String(p.description || '').toLowerCase()
      const cat = String(p.category || '').toLowerCase()
      // Lightweight relevance: title matches matter most.
      return (title.includes(q) ? 3 : 0) + (desc.includes(q) ? 1 : 0) + (cat.includes(q) ? 1 : 0)
    }

    let next = principles.slice()

    // Filters
    if (featuredOnly) next = next.filter((p) => !!p.featured)
    if (authorFilter !== 'all') next = next.filter((p) => p.createdBy === authorFilter)
    if (categoryFilter !== 'all') next = next.filter((p) => p.category === categoryFilter)

    // Search
    if (q) next = next.filter((p) => score(p) > 0)

    // Sort
    next.sort((a, b) => {
      if (sortBy === 'popularity') return (b.likes || 0) - (a.likes || 0)
      if (sortBy === 'recency') return getDate(b) - getDate(a)
      if (sortBy === 'title') return String(a.title || '').localeCompare(String(b.title || ''))

      // relevance (default): if no query, fall back to recency
      if (!q) return getDate(b) - getDate(a)
      const diff = score(b) - score(a)
      if (diff !== 0) return diff
      return getDate(b) - getDate(a)
    })

    setFilteredPrinciples(next)
  }, [searchTerm, principles, sortBy, authorFilter, categoryFilter, featuredOnly])

  const handleSavePrinciple = (principleData: any) => {
    if (!canEdit && editingPrinciple) {
      alert('You do not have permission to modify principles.')
      return
    }

    if (editingPrinciple) {
      const updated = principles.map((p) =>
        p.id === editingPrinciple.id
          ? { ...principleData, id: editingPrinciple.id, updatedAt: new Date().toISOString(), updatedBy: user.name }
          : p
      )
      setPrinciples(updated)
      localStorage.setItem('stod_principles', JSON.stringify(updated))
    } else {
      const newPrinciple = {
        ...principleData,
        id: Date.now(),
        createdBy: user.name,
        createdById: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'In Process',
        likes: 0,
        savedBy: [],
      }
      const updated = [...principles, newPrinciple]
      setPrinciples(updated)
      localStorage.setItem('stod_principles', JSON.stringify(updated))
    }
    setShowModal(false)
    setEditingPrinciple(null)
  }

  const handleEdit = (principle: any) => {
    setEditingPrinciple(principle)
    setShowModal(true)
  }

  const [lockedPrinciple, setLockedPrinciple] = useState<any | null>(null)

  const isPrincipleLockedForUser = (principle: any) => {
    return !canOpenPrinciple({
      role,
      user,
      principle,
      allowedFeaturedIds,
    })
  }

  const handleOpenReader = (principle: any) => {
    if (isPrincipleLockedForUser(principle)) {
      setLockedPrinciple(principle)
      return
    }
    setAdvancedReaderInitialId(Number(principle?.id) || null)
    setAdvancedReaderOpen(true)
  }

  const handleOpenTool = (tool: ToolKey) => {
    if (!allowTools) {
      alert('Tools are available to Subscribers and above.')
      return
    }
    // Gate tools behind subscription (all roles can see Tools, but need a plan to open tools).
    if (!toolsSubscribed) {
      setPendingTool(tool)
      setActiveTool(null)
      return
    }
    setActiveTool(tool)
    setPendingTool(null)
  }

  // Reset tool navigation when leaving the Tools tab
  useEffect(() => {
    if (activeTab !== 'matrix') {
      setActiveTool(null)
      setPendingTool(null)
    }
  }, [activeTab])

  // Guard: if the current role is not allowed to view a tab, redirect to a safe default.
  useEffect(() => {
    if (activeTab === 'matrix' && !allowTools) setActiveTab('principles')
    if (activeTab === 'collaborate' && !allowCollaborate) setActiveTab('principles')
    if (activeTab === 'review' && !allowReview) setActiveTab('principles')
    if (activeTab === 'users' && !allowUsers) setActiveTab('principles')
  }, [activeTab, allowTools, allowCollaborate, allowReview, allowUsers])

  const handleSubscribeTools = (plan: ToolsSubscriptionPlan) => {
    const pricing = TOOLS_PRICING[plan]
    const credits = Number(user?.credits || 0)
    if (credits < pricing.credits) {
      alert(`Not enough credits. You need ${pricing.credits} credits.`)
      return
    }

    const now = Date.now()
    const current = toolsSubscription
    const base = isSubscriptionActive(current) ? Date.parse(current!.expiresAt) : now
    const startedAt = isSubscriptionActive(current) ? current!.startedAt : new Date(now).toISOString()
    const nextSub: ToolsSubscription = {
      plan,
      startedAt,
      expiresAt: addDays(base, pricing.days),
    }

    const newExpiryLabel = new Date(nextSub.expiresAt).toLocaleString()
    const remaining = credits - pricing.credits
    const isRenewal = isSubscriptionActive(current)
    const ok = confirm(
      `${isRenewal ? 'Confirm renewal' : 'Confirm purchase'}\n\n` +
        `Plan: ${pricing.label}\n` +
        `Cost: ${pricing.credits} credits\n` +
        `New expiry: ${newExpiryLabel}\n` +
        `Remaining credits: ${remaining}\n\n` +
        `Proceed?`
    )
    if (!ok) return

    const nextUser = { ...user, credits: credits - pricing.credits }
    localStorage.setItem('stod_user', JSON.stringify(nextUser))
    onUpdateUser?.(nextUser)

    saveToolsSubscription(user.id, nextSub)
    setToolsSubscription(nextSub)

    // Auto-open the tool the user was trying to access.
    if (pendingTool) {
      setActiveTool(pendingTool)
      setPendingTool(null)
    }
  }

  const handleDelete = (id: number) => {
    if (!canDelete) {
      alert('You do not have permission to delete principles.')
      return
    }
    if (confirm('Are you sure you want to delete this principle?')) {
      const updated = principles.filter((p) => p.id !== id)
      setPrinciples(updated)
      localStorage.setItem('stod_principles', JSON.stringify(updated))
    }
  }

  const handleSave = (principleId: number) => {
    const principle = principles.find(p => p.id === principleId)
    if (!principle) return

    const savedBy = principle.savedBy || []
    const isSaved = savedBy.includes(user.id)

    const updated = principles.map(p => {
      if (p.id === principleId) {
        return {
          ...p,
          savedBy: isSaved 
            ? savedBy.filter((id: number) => id !== user.id)
            : [...savedBy, user.id]
        }
      }
      return p
    })
    setPrinciples(updated)
    localStorage.setItem('stod_principles', JSON.stringify(updated))
  }

  const getRoleInfo = () => {
    const roleInfo: Record<string, { desc: string; color: string; icon: any }> = {
      'Non-subscriber': { desc: 'Start here. Explore everything during Phase 1 (permissions will tighten later).', color: 'from-gray-400 to-gray-600', icon: FiEye },
      'Subscriber': { desc: 'Full access during Phase 1. Later: premium tools and community benefits.', color: 'from-cyan-500 to-cyan-700', icon: FiBook },
      'Moderator': { desc: 'Review and validate submissions. Earn curation credits. Can cash out.', color: 'from-blue-500 to-blue-700', icon: FiCheckCircle },
      'Admin': { desc: 'Full system control, user management, credit economy oversight.', color: 'from-purple-500 to-purple-700', icon: FiUsers },
    }
    return roleInfo[user?.role] || roleInfo['Non-subscriber']
  }

  const roleInfo = getRoleInfo()
  const RoleIcon = roleInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-3 shadow-lg">
                <FiBook className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 leading-tight text-gray-900">
                  <span className="italic font-extrabold tracking-tight">Same Thing Only Different</span>{' '}
                  <span className="not-italic font-semibold tracking-wide text-gray-500 text-2xl align-baseline">
                    Repository
                  </span>
                </h1>
                <p className="text-xs text-gray-500">
                  Principles • Pattern Recognition • Real-World Application
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-xl">
                <div className={`bg-gradient-to-r ${roleInfo.color} rounded-lg p-2`}>
                  <RoleIcon className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition font-medium"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-purple-600/85 to-indigo-700/85 backdrop-blur-md text-white shadow-xl border border-white/20">
          <div className="text-center">
            <p className="text-xl font-bold italic mb-2">
              "Same Thing Only Different"
            </p>
            <p className="text-sm opacity-90">
              Every problem is a variation of something you've seen before. Recognize the pattern. 
              Apply the universal truth. Make it real.
            </p>
            <p className="text-xs mt-3 opacity-75">
              — Inspired by the teachings of Gary D. Kennedy
            </p>
          </div>
        </div>

        <div className={`mb-6 p-5 rounded-2xl bg-gradient-to-r ${roleInfo.color}/85 backdrop-blur-md text-white shadow-lg border border-white/20`}>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
              <RoleIcon className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">{user.role} Role</h3>
              <p className="text-sm opacity-90">{roleInfo.desc}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6 border-b-2 border-gray-200">
          <nav className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('principles')}
              className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap ${
                activeTab === 'principles'
                  ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiBook />
                Search
              </div>
            </button>
            {canSave && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap ${
                  activeTab === 'saved'
                    ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiSave />
                  Favorites
                </div>
              </button>
            )}
            {canAccessForums && (
              <button
                onClick={() => setActiveTab('forums')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap ${
                  activeTab === 'forums'
                    ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiMessageSquare />
                  Forums
                </div>
              </button>
            )}
            <button
              onClick={() => setActiveTab('matrix')}
                disabled={!allowTools}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap flex items-center gap-2 ${
                  !allowTools
                    ? 'text-gray-400 cursor-not-allowed'
                    : activeTab === 'matrix'
                      ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <FiZap />
                Tools
                {!allowTools && <FiLock className="text-sm" />}
            </button>
            {canAccessVideos && (
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap ${
                  activeTab === 'videos'
                    ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiPlay />
                  Videos
                </div>
              </button>
            )}
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap ${
                activeTab === 'sessions'
                  ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiCalendar />
                Sessions
              </div>
            </button>
            {canSubmitPrinciples && (
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap ${
                  activeTab === 'submissions'
                    ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiUpload />
                  Propose
                </div>
              </button>
            )}
            <button
              onClick={() => setActiveTab('collaborate')}
              disabled={!allowCollaborate}
              className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap flex items-center gap-2 ${
                !allowCollaborate
                  ? 'text-gray-400 cursor-not-allowed'
                  : activeTab === 'collaborate'
                    ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiUsers />
              Collaborate
              {!allowCollaborate && <FiLock className="text-sm" />}
            </button>
            <button
              onClick={() => setActiveTab('credits')}
              className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap ${
                activeTab === 'credits'
                  ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiDollarSign />
                Credits
              </div>
            </button>
            {allowReview && (
              <button
                onClick={() => setActiveTab('review')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap ${
                  activeTab === 'review'
                    ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiCheckCircle />
                  Review
                </div>
              </button>
            )}
            {allowUsers && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiUsers />
                  Users
                </div>
              </button>
            )}
          </nav>
        </div>

        {activeTab === 'principles' && (
          <>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-2xl">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search principles..."
                  className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-md border-2 border-white/70 rounded-2xl shadow-md focus:ring-4 focus:ring-primary-500/25 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-500"
                />
              </div>
              {!canCreate && (
                <div className="text-sm text-gray-500 flex items-center px-4">
                  <span>Read-only access</span>
                </div>
              )}
            </div>

            {/* Filters + Sort */}
            <div className="mb-6 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-white/90 backdrop-blur-md border border-white/70 rounded-xl shadow-sm text-sm text-gray-900 focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="recency">Recency</option>
                    <option value="popularity">Popularity</option>
                    <option value="title">Title (A–Z)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</span>
                  <select
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                    className="px-3 py-2 bg-white/90 backdrop-blur-md border border-white/70 rounded-xl shadow-sm text-sm text-gray-900 focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500"
                  >
                    <option value="all">All</option>
                    {authorOptions.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-white/90 backdrop-blur-md border border-white/70 rounded-xl shadow-sm text-sm text-gray-900 focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500"
                  >
                    <option value="all">All</option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur-md border border-white/70 rounded-xl shadow-sm text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                    className="accent-primary-600"
                  />
                  Featured only
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setSortBy('relevance')
                  setAuthorFilter('all')
                  setCategoryFilter('all')
                  setFeaturedOnly(false)
                }}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-white/60 transition"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrinciples.map((principle) => (
                <PrincipleCard
                  key={principle.id}
                  principle={principle}
                  user={user}
                  onEdit={canEdit ? handleEdit : undefined}
                  onDelete={canDelete ? handleDelete : undefined}
                  onSave={canSave ? handleSave : undefined}
                  onOpen={handleOpenReader}
                  userRole={user.role}
                  isLocked={isPrincipleLockedForUser(principle)}
                  onUnlock={() => setLockedPrinciple(principle)}
                />
              ))}
            </div>

            {filteredPrinciples.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FiBook className="mx-auto text-4xl mb-4 text-gray-300" />
                <p>No principles found. {canCreate ? 'Use “Propose” to add a principle.' : 'You have read-only access.'}</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && <SavedPrinciples user={user} principles={principles} />}
        {activeTab === 'forums' && <Forums user={user} />}
        {activeTab === 'credits' && (
          <CreditsWallet
            user={user}
            onPurchase={() => alert('Purchase credits flow coming soon!')}
            onCashOut={() => alert('Cash out feature coming soon!')}
          />
        )}
        {activeTab === 'matrix' && allowTools && (
          <>
            {activeTool === null ? (
              <ToolsHub
                user={user}
                isSubscribed={toolsSubscribed}
                subscription={toolsSubscription}
                pendingTool={pendingTool}
                onRequestTool={(t) => setPendingTool(t)}
                onSubscribe={handleSubscribeTools}
                onOpenTool={handleOpenTool}
              />
            ) : (
              <div>
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTool(null)}
                    className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-white/60 transition"
                  >
                    ← Back to Tools
                  </button>
                </div>

                {activeTool === 'dissonance-matrix' && (
                  <DissonanceMatrix user={user} principles={principles} />
                )}

                {activeTool === 'principle-map' && (
                  <PrincipleMap
                    principles={principles}
                    onOpenPrinciple={(p) => handleOpenReader(p)}
                  />
                )}

                {/* Advanced Reader is now the default principle reader (opened from Search). */}
              </div>
            )}
          </>
        )}
        {activeTab === 'videos' && <Videos user={user} />}
        {activeTab === 'sessions' && <Sessions user={user} onCreditUpdate={(newCredits) => {
          // Credits are already updated in localStorage by Sessions component
          // This callback can be used for future real-time updates if needed
        }} />}
        {activeTab === 'submissions' && (
          <PrincipleSubmission
            user={user}
            principles={principles}
            setPrinciples={setPrinciples}
            initialDraftId={proposeOpenDraftId}
            initialStep={2}
          />
        )}
        {activeTab === 'collaborate' && (
          <Collaborate
            user={user}
            onOpenDraft={(draftId) => {
              setProposeOpenDraftId(draftId)
              setActiveTab('submissions')
            }}
          />
        )}
        {activeTab === 'review' && allowReview && <CuratorReview user={user} principles={principles} setPrinciples={setPrinciples} />}
        {activeTab === 'users' && allowUsers && <UserManagement />}
      </main>

      {showModal && (
        <PrincipleModal
          principle={editingPrinciple}
          onSave={handleSavePrinciple}
          onClose={() => {
            setShowModal(false)
            setEditingPrinciple(null)
          }}
        />
      )}

      {advancedReaderOpen && (
        <div className="fixed inset-0 z-[120]">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close reader"
            onClick={() => setAdvancedReaderOpen(false)}
          />
          <div className="absolute inset-0 overflow-y-auto">
            <div className="min-h-full px-4 py-6">
              <div className="mx-auto w-full max-w-7xl">
                <div className="sticky top-3 z-10 mb-4 flex items-center justify-between gap-3 rounded-2xl bg-white/90 backdrop-blur-md border border-white/60 shadow-md px-4 py-3">
                  <div className="text-sm font-semibold text-gray-700">Advanced Reader</div>
                  <button
                    type="button"
                    onClick={() => setAdvancedReaderOpen(false)}
                    className="px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700 font-semibold"
                  >
                    Close
                  </button>
                </div>

                <AdvancedReader
                  user={user}
                  principles={principles}
                  initialPrincipleId={advancedReaderInitialId}
                  onGoToVideos={() => {
                    setAdvancedReaderOpen(false)
                    setActiveTab('videos')
                  }}
                  onGoToSessions={() => {
                    setAdvancedReaderOpen(false)
                    setActiveTab('sessions')
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upsell modal for locked principles (Non-subscriber) */}
      {lockedPrinciple && (
        <div className="fixed inset-0 z-[130]">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close unlock"
            onClick={() => setLockedPrinciple(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/60 overflow-hidden">
              <div className="p-5 border-b border-gray-200/70 flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-bold text-gray-900">Unlock this principle</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Become a <span className="font-semibold">Subscriber</span> to access the full library.
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700 font-semibold"
                  onClick={() => setLockedPrinciple(null)}
                >
                  Close
                </button>
              </div>

              <div className="p-5">
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Principle</div>
                  <div className="text-gray-900 font-semibold mt-1">
                    {String(lockedPrinciple?.title || '—')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {lockedPrinciple?.category ? String(lockedPrinciple.category) : ''}
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const nextUser = { ...user, role: 'Subscriber' }
                      localStorage.setItem('stod_user', JSON.stringify(nextUser))
                      onUpdateUser?.(nextUser)
                      setLockedPrinciple(null)
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
                  >
                    Become Subscriber
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockedPrinciple(null)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                  >
                    Not now
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Note: this is a demo. “Become Subscriber” updates your local role in this browser.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}