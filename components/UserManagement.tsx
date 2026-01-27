'use client'

import { useState, useEffect } from 'react'
import { FiUser, FiEdit2, FiTrash2, FiPlus, FiShield, FiUsers } from 'react-icons/fi'
import { DEMO_USERS_6 } from '@/lib/demoUsers'

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  useEffect(() => {
    // Load users from localStorage
    const stored = localStorage.getItem('stod_users')
    if (stored) {
      setUsers(JSON.parse(stored))
    } else {
      // Initialize with sample users
      const sampleUsers = DEMO_USERS_6.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        email: u.email || `${u.username}@stod.demo`,
        status: u.status || 'Active',
      }))
      setUsers(sampleUsers)
      localStorage.setItem('stod_users', JSON.stringify(sampleUsers))
    }
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-700'
      case 'Moderator':
        return 'bg-blue-100 text-blue-700'
      case 'Subscriber':
        return 'bg-cyan-100 text-cyan-700'
      case 'Non-subscriber':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const updated = users.filter((u) => u.id !== id)
      setUsers(updated)
      localStorage.setItem('stod_users', JSON.stringify(updated))
    }
  }

  const roles = ['Admin', 'Moderator', 'Subscriber', 'Non-subscriber']

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage users and their roles in the system</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-medium"
        >
          <FiPlus />
          Add User
        </button>
      </div>

      {/* Role Permissions Info */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FiShield />
          Role Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="font-medium text-blue-900">Admin:</span>
            <p className="text-blue-700">Full access, user management</p>
          </div>
          <div>
            <span className="font-medium text-blue-900">Moderator:</span>
            <p className="text-blue-700">Review and validate submissions</p>
          </div>
          <div>
            <span className="font-medium text-blue-900">Subscriber:</span>
            <p className="text-blue-700">Collaborate + full access (except admin-only)</p>
          </div>
          <div>
            <span className="font-medium text-blue-900">Non-subscriber:</span>
            <p className="text-blue-700">Limited access (locked tools/collaboration)</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/75 backdrop-blur-md rounded-lg shadow-md overflow-hidden border border-white/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/60 backdrop-blur-sm border-b border-white/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-white/30">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/40">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <FiUser className="text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user)
                          setShowModal(true)
                        }}
                        className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <UserModal
          user={editingUser}
          roles={roles}
          onSave={(userData: any) => {
            if (editingUser) {
              const updated = users.map((u) =>
                u.id === editingUser.id ? { ...userData, id: editingUser.id } : u
              )
              setUsers(updated)
              localStorage.setItem('stod_users', JSON.stringify(updated))
            } else {
              const newUser = { ...userData, id: Date.now() }
              const updated = [...users, newUser]
              setUsers(updated)
              localStorage.setItem('stod_users', JSON.stringify(updated))
            }
            setShowModal(false)
            setEditingUser(null)
          }}
          onClose={() => {
            setShowModal(false)
            setEditingUser(null)
          }}
        />
      )}
    </div>
  )
}

function UserModal({ user, roles, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'Non-subscriber',
    status: 'Active',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Non-subscriber',
        status: user.status || 'Active',
      })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-lg shadow-xl max-w-md w-full border border-white/30">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                {roles.map((role: string) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            >
              {user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

