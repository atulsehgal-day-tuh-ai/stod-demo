'use client'

import { FiSave, FiTrash2 } from 'react-icons/fi'

interface SavedPrinciplesProps {
  user: any
  principles: any[]
}

export default function SavedPrinciples({ user, principles }: SavedPrinciplesProps) {
  const savedPrinciples = principles.filter(p => p.savedBy && p.savedBy.includes(user.id))

  const handleUnsave = (principleId: number) => {
    const updated = principles.map(p => {
      if (p.id === principleId) {
        return {
          ...p,
          savedBy: p.savedBy.filter((id: number) => id !== user.id)
        }
      }
      return p
    })
    localStorage.setItem('stod_principles', JSON.stringify(updated))
    window.location.reload()
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Saved Principles</h2>
        <p className="text-gray-600 mt-1">Your personal collection of principles you've liked</p>
      </div>

      {savedPrinciples.length === 0 ? (
        <div className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/40">
          <FiSave className="mx-auto text-4xl mb-4 text-gray-300" />
          <p className="text-gray-500">No saved principles yet</p>
          <p className="text-sm text-gray-400 mt-2">Save principles you find valuable to access them quickly</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPrinciples.map((principle) => (
            <div key={principle.id} className="bg-white/75 backdrop-blur-md rounded-xl shadow-md p-6 border-2 border-white/30 hover:border-cyan-300/50 transition-all relative">
              <button
                onClick={() => handleUnsave(principle.id)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition"
              >
                <FiTrash2 />
              </button>
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{principle.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="bg-primary-50/70 backdrop-blur-sm px-2 py-1 rounded-lg font-semibold">{principle.category}</span>
                  <span className="text-gray-400">•</span>
                  <span>v{principle.version}</span>
                </div>
              </div>
              <p className="text-gray-700 text-sm line-clamp-3">{principle.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
