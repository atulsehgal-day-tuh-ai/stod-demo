'use client'

import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiGift, FiZap } from 'react-icons/fi'

interface CreditsWalletProps {
  user: any
  onPurchase?: () => void
  onCashOut?: () => void
}

export default function CreditsWallet({ user, onPurchase, onCashOut }: CreditsWalletProps) {
  const getWalletDescription = () => {
    switch (user.walletStatus) {
      case 'Empty':
      case 'Starter':
        return '✨ Fast start bonus received! Upgrade to Learner to spend credits.'
      case 'Rechargeable':
        return '💳 Purchase credit packs to unlock premium content.'
      case 'Monthly Allowance':
        return '📅 Monthly subscription includes recurring credit allowance.'
      case 'Accumulator':
        return '💰 Earn credits through principle submissions and royalties.'
      case 'Stakeholder':
        return '🎯 Earn credits for curation work. Can cash out or transfer.'
      case 'Infinite':
        return '⚡ System administrator with unlimited credits.'
      default:
        return ''
    }
  }

  const getWalletIcon = () => {
    switch (user.walletStatus) {
      case 'Starter':
        return <FiGift className="text-yellow-500 text-2xl" />
      case 'Rechargeable':
        return <FiShoppingCart className="text-blue-500 text-2xl" />
      case 'Monthly Allowance':
        return <FiZap className="text-green-500 text-2xl" />
      case 'Accumulator':
        return <FiTrendingUp className="text-purple-500 text-2xl" />
      case 'Stakeholder':
        return <FiDollarSign className="text-orange-500 text-2xl" />
      case 'Infinite':
        return <FiZap className="text-primary-500 text-2xl" />
      default:
        return <FiDollarSign className="text-gray-500 text-2xl" />
    }
  }

  const canPurchase = ['Learner', 'Practitioner'].includes(user.role)
  const canCashOut = user.role === 'Curator'

  return (
    <div className="bg-gradient-to-br from-primary-50/80 via-primary-100/80 to-purple-50/80 backdrop-blur-md rounded-2xl p-6 border-2 border-primary-200/50 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md">
            {getWalletIcon()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">STOD Credits</h3>
            <p className="text-sm text-gray-600 mt-1">{getWalletDescription()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            {user.credits?.toLocaleString() || 0}
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">
            {user.walletStatus || 'Empty'}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {canPurchase && (
          <button
            onClick={onPurchase}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <FiShoppingCart />
            Purchase Credits
          </button>
        )}
        {canCashOut && (
          <button
            onClick={onCashOut}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <FiTrendingUp />
            Cash Out
          </button>
        )}
      </div>
    </div>
  )
}
