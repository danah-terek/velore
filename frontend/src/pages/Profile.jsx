import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import ProfileSidebar from '../components/profile/ProfileSidebar'

export default function Profile() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  if (!token) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-16 py-12">
      <h1 className="text-3xl font-semibold text-gray-900 mb-3">My Profile</h1>
      <p className="text-sm text-gray-600 mb-6">Manage your account, loyalty, orders, and reviews.</p>
      <button
        onClick={() => setOpen(true)}
        className="bg-gray-900 text-white hover:bg-gray-700 px-4 py-2 text-sm font-medium transition-colors duration-300"
      >
        Open Profile Sidebar
      </button>

      <ProfileSidebar
        isOpen={open}
        onClose={() => {
          setOpen(false)
          navigate('/')
        }}
        onLogout={() => {
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          localStorage.removeItem('user')
          navigate('/login')
        }}
      />
    </div>
  )
}
