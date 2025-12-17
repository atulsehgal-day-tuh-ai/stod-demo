'use client'

import { useState, useEffect } from 'react'
import { FiLogOut, FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiUser, FiBook, FiSave, FiUsers, FiMessageSquare, FiHelpCircle, FiUpload, FiCheckCircle, FiStar, FiZap, FiPlay, FiCalendar } from 'react-icons/fi'
import PrincipleCard from './PrincipleCard'
import PrincipleModal from './PrincipleModal'
import UserManagement from './UserManagement'
import CreditsWallet from './CreditsWallet'
import PrincipleSubmission from './PrincipleSubmission'
import CuratorReview from './CuratorReview'
import Forums from './Forums'
import SavedPrinciples from './SavedPrinciples'
import DissonanceMatrix from './DissonanceMatrix'
import Videos from './Videos'
import Sessions from './Sessions'

interface DashboardProps {
  user: any
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [principles, setPrinciples] = useState<any[]>([])
  const [filteredPrinciples, setFilteredPrinciples] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPrinciple, setEditingPrinciple] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'principles' | 'users' | 'submissions' | 'review' | 'forums' | 'saved' | 'matrix' | 'videos' | 'sessions'>('principles')
  const [showCreditsModal, setShowCreditsModal] = useState(false)

  // Role-based permissions
  const isSeeker = user?.role === 'Seeker'
  const isLearner = user?.role === 'Learner'
  const isPractitioner = user?.role === 'Practitioner'
  const isArchitect = user?.role === 'Architect'
  const isCurator = user?.role === 'Curator'
  const isAdmin = user?.role === 'Admin'

  const canView = true
  const canSave = ['Learner', 'Practitioner', 'Architect', 'Curator', 'Admin'].includes(user?.role || '')
  const canCreate = ['Architect', 'Curator', 'Admin'].includes(user?.role || '')
  const canEdit = ['Curator', 'Admin'].includes(user?.role || '')
  const canDelete = user?.role === 'Admin'
  const canCurate = ['Curator', 'Admin'].includes(user?.role || '')
  const canManageUsers = user?.role === 'Admin'
  const canAccessForums = ['Practitioner', 'Architect', 'Curator', 'Admin'].includes(user?.role || '')
  const canSubmitPrinciples = ['Architect', 'Curator', 'Admin'].includes(user?.role || '')
  const canAccessMatrix = ['Practitioner', 'Architect', 'Curator', 'Admin'].includes(user?.role || '')
  const canAccessVideos = ['Practitioner', 'Architect', 'Curator', 'Admin'].includes(user?.role || '')

  useEffect(() => {
    const stored = localStorage.getItem('stod_principles')
    if (stored) {
      const data = JSON.parse(stored)
      setPrinciples(data)
      setFilteredPrinciples(data)
    } else {
      const sampleData = [
        {
          id: 1,
          title: 'Same Thing Only Different - Pattern Recognition',
          category: 'Universal Truth',
          description: 'Everything is connected. When you see a new problem, recognize it as "I\'ve seen this before" - same thing, only different. The pattern is universal, the context changes. This principle applies across domains: business, relationships, technology, life itself.',
          status: 'Core Principles',
          version: '3.0',
          createdBy: 'Alex Architect',
          createdById: 3,
          curatorName: 'Sarah Curator',
          curatorId: 2,
          featured: true,
          mostLiked: true,
          likes: 89,
          hardQuestions: [
            'What patterns have you seen before that apply to your current challenge?',
            'How is this situation "the same thing only different" from something you\'ve experienced?',
            'What universal truth underlies this problem that you can recognize from other domains?'
          ],
          takeHomeValue: 'Recognize patterns. Connect the dots. See the familiar in the unfamiliar. Every problem is a variation of something you\'ve seen before.',
          savedBy: [5, 4, 3, 2],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Pay Attention - The Power of Observation',
          category: 'Wisdom',
          description: 'Most people miss the obvious because they\'re not paying attention. The best insights come from simply observing what\'s right in front of you. Notice what others miss. See the details. The answer is often staring you in the face.',
          status: 'Core Principles',
          version: '2.5',
          createdBy: 'Alex Architect',
          createdById: 3,
          curatorName: 'Sarah Curator',
          curatorId: 2,
          featured: true,
          likes: 67,
          hardQuestions: [
            'What are you not seeing that\'s right in front of you?',
            'What details are others missing that you can observe?',
            'How can you train yourself to pay better attention to what matters?'
          ],
          takeHomeValue: 'Stop. Look. Listen. The answer is usually right there when you pay attention.',
          savedBy: [5, 4],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: 'Context Matters - The Why Behind Everything',
          category: 'Problem Solving',
          description: 'Understanding context is everything. The "why" matters more than the "what". Before you act, understand the full picture. Why is this happening? What\'s the real problem? What are you really trying to solve? Context prevents mistakes and reveals solutions.',
          status: 'Core Principles',
          version: '2.0',
          createdBy: 'Alex Architect',
          createdById: 3,
          curatorName: 'Sarah Curator',
          curatorId: 2,
          featured: true,
          likes: 54,
          hardQuestions: [
            'What is the real problem you\'re trying to solve?',
            'Why is this happening? What\'s the context you\'re missing?',
            'What would happen if you understood the full picture before acting?'
          ],
          takeHomeValue: 'Always ask why. Context matters more than content. Understand before you act.',
          savedBy: [5],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 4,
          title: 'Apply to Real Life - Hard Questions That Matter',
          category: 'Application',
          description: 'Principles are useless unless you apply them. Ask the hard questions. Make it real. What does this mean for YOUR situation? How does this change YOUR behavior? Connect every principle back to something you can actually use today.',
          status: 'Core Principles',
          version: '1.8',
          createdBy: 'Alex Architect',
          createdById: 3,
          curatorName: 'Sarah Curator',
          curatorId: 2,
          likes: 43,
          hardQuestions: [
            'How does this principle apply to your actual life right now?',
            'What will you do differently because of this insight?',
            'What\'s the one thing you can apply today that will make a difference?'
          ],
          takeHomeValue: 'Make it real. Apply it today. Connect principles to practice. Hard questions lead to real change.',
          savedBy: [4, 3],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 5,
          title: 'Learn from Experience - The Cost of Mistakes',
          category: 'Wisdom',
          description: 'Mistakes are expensive teachers, but they\'re the best ones. Learn from your experience. Learn from others\' experience. Don\'t repeat what doesn\'t work. Recognize patterns of failure. The cost of not learning is doing it wrong again.',
          status: 'In Process',
          workflowStage: 'Under Review',
          currentAssignee: 'Sarah Curator',
          version: '1.2',
          createdBy: 'Alex Architect',
          createdById: 3,
          curatorId: 2,
          curatorName: 'Sarah Curator',
          likes: 31,
          hardQuestions: [
            'What mistakes have you made that you keep repeating?',
            'What patterns of failure can you recognize and avoid?',
            'How can you learn from others\' expensive mistakes instead of making your own?'
          ],
          takeHomeValue: 'Learn from mistakes. Recognize failure patterns. Don\'t pay the same price twice.',
          savedBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setPrinciples(sampleData)
      setFilteredPrinciples(sampleData)
      localStorage.setItem('stod_principles', JSON.stringify(sampleData))
    }
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = principles.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPrinciples(filtered)
    } else {
      setFilteredPrinciples(principles)
    }
  }, [searchTerm, principles])

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
      'Seeker': { desc: 'Browse and discover value. Read-only access with fast start bonus.', color: 'from-gray-400 to-gray-600', icon: FiEye },
      'Learner': { desc: 'Save principles, intelligent search, track interests. Can purchase credits.', color: 'from-cyan-500 to-cyan-700', icon: FiBook },
      'Practitioner': { desc: 'Access forums, hard questions, full videos. Monthly credit allowance.', color: 'from-orange-500 to-orange-700', icon: FiMessageSquare },
      'Architect': { desc: 'Submit new principles, earn royalties. Build the library.', color: 'from-green-500 to-green-700', icon: FiUpload },
      'Curator': { desc: 'Review and validate submissions. Earn curation credits. Can cash out.', color: 'from-blue-500 to-blue-700', icon: FiCheckCircle },
      'Admin': { desc: 'Full system control, user management, credit economy oversight.', color: 'from-purple-500 to-purple-700', icon: FiUsers },
    }
    return roleInfo[user?.role] || roleInfo['Seeker']
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                  STOD Repository
                </h1>
                <p className="text-gray-600 font-medium italic text-lg mb-1">
                  Same Thing Only Different
                </p>
                <p className="text-xs text-gray-500">
                  Universal Truths • Pattern Recognition • Real-World Application
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
        <div className="mb-6">
          <CreditsWallet 
            user={user} 
            onPurchase={() => setShowCreditsModal(true)}
            onCashOut={() => alert('Cash out feature coming soon!')}
          />
        </div>

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
                Principles
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
                  Saved
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
            {canAccessMatrix && (
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap ${
                  activeTab === 'matrix'
                    ? 'text-primary-600 border-b-4 border-primary-600 bg-primary-50/70 backdrop-blur-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiZap />
                  Matrix
                </div>
              </button>
            )}
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
                  Submit
                </div>
              </button>
            )}
            {canCurate && (
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
            {canManageUsers && (
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
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search principles..."
                  className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/40 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
              {canCreate ? (
                <button
                  onClick={() => {
                    setEditingPrinciple(null)
                    setShowModal(true)
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiPlus />
                  Add Principle
                </button>
              ) : (
                <div className="text-sm text-gray-500 flex items-center px-4">
                  <span>Read-only access</span>
                </div>
              )}
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
                  userRole={user.role}
                />
              ))}
            </div>

            {filteredPrinciples.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FiBook className="mx-auto text-4xl mb-4 text-gray-300" />
                <p>No principles found. {canCreate ? 'Click "Add Principle" to create one.' : 'You have read-only access.'}</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && <SavedPrinciples user={user} principles={principles} />}
        {activeTab === 'forums' && <Forums user={user} />}
        {activeTab === 'matrix' && <DissonanceMatrix user={user} principles={principles} />}
        {activeTab === 'videos' && <Videos user={user} />}
        {activeTab === 'sessions' && <Sessions user={user} onCreditUpdate={(newCredits) => {
          // Credits are already updated in localStorage by Sessions component
          // This callback can be used for future real-time updates if needed
        }} />}
        {activeTab === 'submissions' && <PrincipleSubmission user={user} principles={principles} setPrinciples={setPrinciples} />}
        {activeTab === 'review' && <CuratorReview user={user} principles={principles} setPrinciples={setPrinciples} />}
        {activeTab === 'users' && <UserManagement />}
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
    </div>
  )
}