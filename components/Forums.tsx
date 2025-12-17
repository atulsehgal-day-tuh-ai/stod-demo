'use client'

import { useState, useEffect } from 'react'
import { FiMessageSquare, FiPlus, FiCalendar, FiUsers } from 'react-icons/fi'

interface ForumsProps {
  user: any
}

export default function Forums({ user }: ForumsProps) {
  const [forums, setForums] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Ongoing' as 'Ongoing' | 'Temporary',
    scheduledDate: '',
  })

  useEffect(() => {
    const stored = localStorage.getItem('stod_forums')
    if (stored) {
      setForums(JSON.parse(stored))
    } else {
      const sampleForums = [
        {
          id: 1,
          title: 'First Principles Thinking Discussion',
          description: 'Deep dive into applying first principles thinking to real-world problems.',
          type: 'Ongoing',
          createdBy: user.id,
          createdByName: user.name,
          registeredUsers: [user.id],
          status: 'Active',
          createdAt: new Date().toISOString(),
        },
      ]
      setForums(sampleForums)
      localStorage.setItem('stod_forums', JSON.stringify(sampleForums))
    }
  }, [user])

  const handleCreateForum = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newForum = {
      id: Date.now(),
      ...formData,
      createdBy: user.id,
      createdByName: user.name,
      registeredUsers: [user.id],
      status: 'Active',
      createdAt: new Date().toISOString(),
    }

    const updated = [...forums, newForum]
    setForums(updated)
    localStorage.setItem('stod_forums', JSON.stringify(updated))
    
    setFormData({
      title: '',
      description: '',
      type: 'Ongoing',
      scheduledDate: '',
    })
    setShowForm(false)
  }

  const handleRegister = (forumId: number) => {
    const updated = forums.map(f => {
      if (f.id === forumId) {
        const isRegistered = f.registeredUsers.includes(user.id)
        return {
          ...f,
          registeredUsers: isRegistered
            ? f.registeredUsers.filter((id: number) => id !== user.id)
            : [...f.registeredUsers, user.id]
        }
      }
      return f
    })
    setForums(updated)
    localStorage.setItem('stod_forums', JSON.stringify(updated))
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Forums</h2>
          <p className="text-gray-600 mt-1">Create and join discussions to apply principles to real life</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FiPlus />
          {showForm ? 'Cancel' : 'Create Forum'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border-2 border-white/30">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Forum</h3>
          <form onSubmit={handleCreateForum} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Ongoing' | 'Temporary' })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>
              {formData.type === 'Temporary' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Date</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              )}
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl"
              >
                Create Forum
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forums.map((forum) => {
          const isRegistered = forum.registeredUsers.includes(user.id)
          return (
            <div key={forum.id} className="bg-white/75 backdrop-blur-md rounded-xl shadow-md p-6 border-2 border-white/30 hover:border-orange-300/50 transition-all">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900">{forum.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  forum.type === 'Ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {forum.type}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{forum.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <FiUsers />
                  <span>{forum.registeredUsers.length} registered</span>
                </div>
                {forum.scheduledDate && (
                  <div className="flex items-center gap-1">
                    <FiCalendar />
                    <span>{new Date(forum.scheduledDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRegister(forum.id)}
                className={`w-full px-4 py-2 rounded-xl transition font-semibold ${
                  isRegistered
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
                }`}
              >
                {isRegistered ? 'Unregister' : 'Register'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
