'use client'

import { FiSave } from 'react-icons/fi'
import PrincipleCard from './PrincipleCard'

interface SavedPrinciplesProps {
  user: any
  principles: any[]
  onOpen: (principle: any) => void
  onToggleFavourite: (id: number) => void
  isLocked: (principle: any) => boolean
  onUnlock: (principle: any) => void
}

export default function SavedPrinciples({ user, principles, onOpen, onToggleFavourite, isLocked, onUnlock }: SavedPrinciplesProps) {
  const savedPrinciples = principles.filter(p => p.savedBy && p.savedBy.includes(user.id))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Favourites</h2>
        <p className="text-gray-600 mt-1">Your saved principles — same experience as Search, just filtered.</p>
      </div>

      {savedPrinciples.length === 0 ? (
        <div className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/40">
          <FiSave className="mx-auto text-4xl mb-4 text-gray-300" />
          <p className="text-gray-500">No favourites yet</p>
          <p className="text-sm text-gray-400 mt-2">Add to Favourites from Search to build your personal list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPrinciples.map((principle) => (
            <PrincipleCard
              key={principle.id}
              principle={principle}
              user={user}
              onSave={(id) => onToggleFavourite(id)}
              onOpen={onOpen}
              isLocked={isLocked(principle)}
              onUnlock={() => onUnlock(principle)}
              userRole={user?.role}
            />
          ))}
        </div>
      )}
    </div>
  )
}
