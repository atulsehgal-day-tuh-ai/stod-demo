'use client'

import { useState } from 'react'
import { FiUpload, FiCheckCircle, FiClock, FiUser, FiArrowRight, FiMessageSquare, FiBookOpen } from 'react-icons/fi'

interface PrincipleSubmissionProps {
  user: any
  principles: any[]
  setPrinciples: (principles: any[]) => void
}

export default function PrincipleSubmission({ user, principles, setPrinciples }: PrincipleSubmissionProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    hardQuestions: ['', '', ''],
    takeHomeValue: '',
  })

  const mySubmissions = principles.filter(p => p.createdById === user.id)
  const inProcess = mySubmissions.filter(p => p.status === 'In Process')
  const corePrinciples = mySubmissions.filter(p => p.status === 'Core Principles')

  const workflowStages = [
    {
      id: 'Proposed',
      name: 'Proposed',
      description: 'Your submission has been received and is waiting for curator assignment.',
      assignee: 'Moderator',
      icon: FiUpload,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'Under Review',
      name: 'Under Review',
      description: 'A curator is actively reviewing your submission for quality and alignment with Universal Truths.',
      assignee: 'Moderator',
      icon: FiClock,
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'Validated',
      name: 'Validated',
      description: 'Curator has approved. The principle is ready for community input and refinement.',
      assignee: 'Community',
      icon: FiCheckCircle,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'Community Q&A',
      name: 'Community Q&A',
      description: 'Open for community questions, discussions, and real-world application examples.',
      assignee: 'Practitioners & Architects',
      icon: FiMessageSquare,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'Published',
      name: 'Published',
      description: 'Final approval complete. The principle is now part of Core Principles and available to all users.',
      assignee: 'System',
      icon: FiBookOpen,
      color: 'from-indigo-500 to-indigo-600',
    },
  ]

  const getWorkflowStage = (principle: any) => {
    return workflowStages.find(s => s.id === principle.workflowStage) || workflowStages[0]
  }

  const categories = ['Development', 'Security', 'Process', 'Quality', 'Documentation', 'Testing', 'Deployment', 'Finance', 'Productivity', 'Problem Solving']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newPrinciple = {
      id: Date.now(),
      ...formData,
      hardQuestions: formData.hardQuestions.filter(q => q.trim() !== ''),
      status: 'In Process',
      workflowStage: 'Proposed',
      currentAssignee: 'Moderator',
      assignedTo: null,
      version: '0.1',
      createdBy: user.name,
      createdById: user.id,
      likes: 0,
      savedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [...principles, newPrinciple]
    setPrinciples(updated)
    localStorage.setItem('stod_principles', JSON.stringify(updated))
    
    setFormData({
      title: '',
      category: '',
      description: '',
      hardQuestions: ['', '', ''],
      takeHomeValue: '',
    })
    setShowForm(false)
    alert('Principle submitted! It will be reviewed by a Curator.')
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submit New Principle</h2>
          <p className="text-gray-600 mt-1">Build the library by identifying and submitting new patterns</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FiUpload />
          {showForm ? 'Cancel' : 'New Submission'}
        </button>
      </div>

      {/* Workflow Overview */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Approval Workflow</h3>
        <div className="relative">
          <div className="flex items-center justify-between">
            {workflowStages.map((stage, idx) => {
              const StageIcon = stage.icon
              return (
                <div key={stage.id} className="flex-1 flex flex-col items-center relative z-10">
                  {idx < workflowStages.length - 1 && (
                    <div 
                      className={`absolute top-5 left-1/2 h-0.5 w-full bg-gradient-to-r ${stage.color}`}
                      style={{ width: 'calc(100% - 40px)', marginLeft: '20px' }}
                    ></div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-gradient-to-r ${stage.color} text-white shadow-lg relative z-20`}>
                    <StageIcon className="text-sm" />
                  </div>
                  <div className="text-xs text-center font-semibold text-gray-900 max-w-[100px] mb-1">
                    {stage.name}
                  </div>
                  <div className="text-xs text-center text-gray-600 max-w-[100px]">
                    {stage.assignee}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>How it works:</strong> Your submission starts as <strong>Proposed</strong> and moves through 
            <strong> Under Review</strong> (Curator), <strong>Validated</strong> (Community), 
            <strong> Community Q&A</strong> (Practitioners), and finally <strong>Published</strong> (Core Principles).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-lg p-3">
              <FiClock className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{inProcess.length}</div>
              <div className="text-sm text-blue-600">In Process</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-lg p-3">
              <FiCheckCircle className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{corePrinciples.length}</div>
              <div className="text-sm text-green-600">Core Principles</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 rounded-lg p-3">
              <FiUpload className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">{mySubmissions.length}</div>
              <div className="text-sm text-purple-600">Total Submissions</div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border-2 border-white/30">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Submit a New Principle</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hard Questions * (at least 2 required)</label>
              {formData.hardQuestions.map((q, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={q}
                  onChange={(e) => {
                    const newQuestions = [...formData.hardQuestions]
                    newQuestions[idx] = e.target.value
                    setFormData({ ...formData, hardQuestions: newQuestions })
                  }}
                  placeholder={`Question ${idx + 1}`}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl mb-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Take Home Value</label>
              <input
                type="text"
                value={formData.takeHomeValue}
                onChange={(e) => setFormData({ ...formData, takeHomeValue: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="One-line summary of the key takeaway"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl"
              >
                Submit for Review
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">My Submissions</h3>
        <div className="space-y-4">
          {mySubmissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiUpload className="mx-auto text-4xl mb-4 text-gray-300" />
              <p>No submissions yet. Submit your first principle!</p>
            </div>
          ) : (
            mySubmissions.map((principle) => {
              const stage = getWorkflowStage(principle)
              const StageIcon = stage.icon
              const currentStageIndex = workflowStages.findIndex(s => s.id === (principle.workflowStage || 'Proposed'))
              
              return (
                <div
                  key={principle.id}
                  className="bg-white/75 backdrop-blur-md rounded-xl shadow-md p-6 border-2 border-white/30 hover:border-green-300/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-bold text-gray-900">{principle.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      principle.status === 'Core Principles' ? 'bg-green-100 text-green-700' :
                      principle.status === 'In Process' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {principle.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{principle.description}</p>

                  {/* Workflow Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`bg-gradient-to-r ${stage.color} rounded-lg p-2`}>
                          <StageIcon className="text-white text-sm" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{stage.name}</div>
                          <div className="text-xs text-gray-600">With: {principle.currentAssignee || stage.assignee}</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{stage.description}</p>
                  </div>

                  {/* Workflow Stages Visualization */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="relative flex items-center justify-between">
                      {workflowStages.map((s, idx) => {
                        const SIcon = s.icon
                        const isActive = idx <= currentStageIndex
                        const isCurrent = s.id === principle.workflowStage
                        return (
                          <div key={s.id} className="flex-1 flex flex-col items-center relative z-10">
                            {idx < workflowStages.length - 1 && (
                              <div 
                                className={`absolute top-5 left-1/2 h-0.5 w-full ${
                                  idx < currentStageIndex 
                                    ? `bg-gradient-to-r ${s.color}` 
                                    : 'bg-gray-200'
                                }`}
                                style={{ width: 'calc(100% - 40px)', marginLeft: '20px' }}
                              ></div>
                            )}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all relative z-20 ${
                              isActive 
                                ? `bg-gradient-to-r ${s.color} text-white shadow-lg` 
                                : 'bg-gray-200 text-gray-400'
                            } ${isCurrent ? 'ring-4 ring-primary-300 scale-110' : ''}`}>
                              <SIcon className="text-sm" />
                            </div>
                            <div className={`text-xs text-center font-medium max-w-[80px] ${
                              isActive ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {s.name}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {principle.curatorName && (
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                      Curated by: <span className="font-semibold">{principle.curatorName}</span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
