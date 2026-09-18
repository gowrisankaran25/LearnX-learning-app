import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const { user, isAuthenticated, loading } = useAuth()
  const { isDark } = useTheme()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center app-shell">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const isStudent = location.pathname.startsWith('/student')
  const isTeacher = location.pathname.startsWith('/teacher')
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className={`min-h-screen app-shell ${isDark ? 'dark' : ''}`}>
      <div className="flex">
        <Sidebar user={user} />
        <div className="min-w-0 flex-1 flex flex-col">
          <Header user={user} />
          <main className="flex-1 min-w-0 p-5 md:p-8 overflow-x-hidden overflow-y-auto app-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
