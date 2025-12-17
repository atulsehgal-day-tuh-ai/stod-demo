'use client'

import { FiEdit2, FiTrash2, FiEye, FiTag, FiClock, FiUser, FiSave, FiStar, FiHelpCircle } from 'react-icons/fi'

interface PrincipleCardProps {
  principle: any
  onEdit?: (principle: any) => void
  onDelete?: (id: number) => void
  onSave?: (id: number) => void
  user?: any
  userRole?: string
}

export default function PrincipleCard({ principle, onEdit, onDelete, onSave, user, userRole }: PrincipleCardProps) {
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

  const canEdit = userRole && ['Curator', 'Admin'].includes(userRole)
  const canDelete = userRole === 'Admin'
  const canSave = userRole && ['Learner', 'Practitioner', 'Architect', 'Curator', 'Admin'].includes(userRole)
  const canAccessHardQuestions = userRole && ['Practitioner', 'Architect', 'Curator', 'Admin'].includes(userRole)

  const isSaved = user && principle.savedBy && principle.savedBy.includes(user.id)
  const isFeatured = principle.featured
  const isMostLiked = principle.mostLiked

  return (
    <div className="bg-white/75 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-white/30 hover:border-primary-300/50 group relative overflow-hidden">
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
          {canSave && onSave && (
            <button
              onClick={() => onSave(principle.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition text-sm font-medium ${
                isSaved
                  ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  : 'bg-white/60 hover:bg-white/80 backdrop-blur-sm text-gray-700'
              }`}
            >
              <FiSave className={isSaved ? 'fill-current' : ''} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(principle)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50/70 hover:bg-primary-100/80 backdrop-blur-sm text-primary-700 rounded-lg transition text-sm font-medium"
            >
              <FiEdit2 />
              Edit
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(principle.id)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition text-sm font-medium"
            >
              <FiTrash2 />
            </button>
          )}
          {!canEdit && !canSave && (
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg transition text-sm font-medium">
              <FiEye />
              View
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

