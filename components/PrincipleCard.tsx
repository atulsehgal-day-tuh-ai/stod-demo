'use client'

import { useState } from 'react'
import { FiEdit2, FiTrash2, FiEye, FiTag, FiClock, FiUser, FiSave, FiStar, FiHelpCircle, FiLock, FiMoreVertical } from 'react-icons/fi'

interface PrincipleCardProps {
  principle: any
  onEdit?: (principle: any) => void
  onDelete?: (id: number) => void
  onSave?: (id: number) => void
  onOpen?: (principle: any) => void
  onUnlock?: (principle: any) => void
  onNotInterested?: (id: number) => void
  isLocked?: boolean
  unlockPrice?: number
  user?: any
  userRole?: string
}

export default function PrincipleCard({
  principle,
  onEdit,
  onDelete,
  onSave,
  onOpen,
  onUnlock,
  onNotInterested,
  isLocked,
  unlockPrice,
  user,
  userRole,
}: PrincipleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Core Principles':
      case 'Published':
        return 'bg-green-100 text-green-700'
      case 'Draft':
        return 'bg-yellow-100 text-yellow-700'
      case 'In Process':
        return 'bg-blue-100 text-blue-700'
      case 'Archived':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-blue-100 text-blue-700'
    }
  }

  const getWorkflowStageColor = (stage: string) => {
    switch (stage) {
      case 'Proposed':
        return 'bg-blue-100 text-blue-700'
      case 'Under Review':
        return 'bg-orange-100 text-orange-700'
      case 'Validated':
        return 'bg-green-100 text-green-700'
      case 'Community Q&A':
        return 'bg-purple-100 text-purple-700'
      case 'Published':
        return 'bg-indigo-100 text-indigo-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Phase 1: everyone can access everything (we’ll tighten later).
  const canEdit = true
  const canDelete = true
  const canSave = true
  const canAccessHardQuestions = true

  const isSaved = user && principle.savedBy && principle.savedBy.includes(user.id)
  const isFeatured = principle.featured
  const isMostLiked = principle.mostLiked
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="bg-white/75 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-white/30 hover:border-primary-300/50 group relative overflow-hidden cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => (isLocked ? onUnlock?.(principle) : onOpen?.(principle))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          isLocked ? onUnlock?.(principle) : onOpen?.(principle)
        }
      }}
    >
      {isLocked && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-white/35" />
          <div className="absolute top-3 right-3 inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-gray-900/85 text-white border border-white/20 backdrop-blur-md">
            <FiLock />
            Locked
          </div>
        </div>
      )}
      {isFeatured && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-bl-lg text-xs font-bold">
          ⭐ Featured
        </div>
      )}

      {isMostLiked && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-br-lg text-xs font-bold">
          💎 Most Liked
        </div>
      )}

      <div className="flex justify-between items-start mb-4 pt-2">
        <h3 className="text-xl font-bold text-gray-900 flex-1 group-hover:text-primary-600 transition-colors">
          {principle.title}
        </h3>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(principle.status)}`}>
            {principle.status}
          </span>
          {principle.workflowStage && principle.status === 'In Process' && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getWorkflowStageColor(principle.workflowStage)}`}>
              {principle.workflowStage}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <FiTag className="text-primary-500" />
                  <span className="font-semibold bg-primary-50/70 backdrop-blur-sm px-2 py-1 rounded-lg">{principle.category}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">v{principle.version}</span>
          {principle.likes > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1 text-purple-600">
                <FiStar className="fill-current" />
                {principle.likes}
              </span>
            </>
          )}
        </div>
        <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">{principle.description}</p>
      </div>

          {principle.workflowStage && principle.status === 'In Process' && (
            <div className="mb-3 p-2 bg-blue-50/70 backdrop-blur-sm rounded-lg border border-blue-200">
              <div className="text-xs text-gray-700">
                <span className="font-semibold">Stage:</span> {principle.workflowStage}
                {principle.currentAssignee && (
                  <> • <span className="font-semibold">With:</span> {principle.currentAssignee}</>
                )}
              </div>
            </div>
          )}
          {principle.curatorName && !principle.workflowStage && (
            <div className="mb-3 p-2 bg-blue-50/70 backdrop-blur-sm rounded-lg border border-blue-200">
              <div className="text-xs text-gray-600">
                <span className="font-semibold">Curated by:</span> {principle.curatorName}
              </div>
            </div>
          )}

      {canAccessHardQuestions && principle.hardQuestions && principle.hardQuestions.length > 0 && (
        <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-1">
            <FiHelpCircle />
            Hard Questions Available
          </div>
          <p className="text-xs text-purple-600 line-clamp-1">
            {principle.hardQuestions[0]}
          </p>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <FiUser className="text-gray-400" />
            <span>{principle.createdBy}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiClock className="text-gray-400" />
            <span>{new Date(principle.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {isLocked && onUnlock && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUnlock(principle)
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-900/85 hover:bg-gray-900 text-white rounded-lg transition text-sm font-semibold border border-white/20 backdrop-blur-sm"
            >
              <FiLock />
              Unlock{typeof unlockPrice === 'number' ? ` (${unlockPrice} cr)` : ''}
            </button>
          )}
          {canSave && onSave && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSave(principle.id)
              }}
              disabled={!!isLocked}
              className={`flex-1 flex items-center justify-start gap-2 px-3 py-2 rounded-lg transition text-sm font-medium ${
                isSaved
                  ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  : 'bg-white/60 hover:bg-white/80 backdrop-blur-sm text-gray-700'
              }`}
            >
              <FiSave className={isSaved ? 'fill-current' : ''} />
              {isSaved ? 'In Favourites' : 'Add to Favourites'}
            </button>
          )}
          {canEdit && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(principle)
              }}
              disabled={!!isLocked}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50/70 hover:bg-primary-100/80 backdrop-blur-sm text-primary-700 rounded-lg transition text-sm font-medium"
            >
              <FiEdit2 />
              Edit
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(principle.id)
              }}
              disabled={!!isLocked}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition text-sm font-medium"
            >
              <FiTrash2 />
            </button>
          )}
          {onNotInterested && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen((v) => !v)
                }}
                className="flex items-center justify-center px-3 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg transition text-sm font-medium"
                aria-label="More actions"
              >
                <FiMoreVertical />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 bottom-12 w-44 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      onNotInterested(principle.id)
                    }}
                  >
                    Not interested
                  </button>
                </div>
              )}
            </div>
          )}
          {!canEdit && !canSave && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                isLocked ? onUnlock?.(principle) : onOpen?.(principle)
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg transition text-sm font-medium"
            >
              {isLocked ? <FiLock /> : <FiEye />}
              {isLocked ? 'Unlock' : 'View'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

