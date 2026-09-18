import { Bell, Search, Moon, Sun, LogOut, ChevronDown, User, Settings, CheckCircle, Trophy, Award, BookOpen, AlertCircle, Megaphone, Star, UserPlus, Flame } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { getInitials, generateColor } from '../../lib/utils'

export default function Header({ user }) {
  const { isDark, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user?.id) return undefined

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const socketUrl = apiUrl.replace(/\/api\/?$/, '')
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] })

    socket.on('connect', () => {
      socket.emit('join-user', user.id)
    })

    socket.on('notification', (notification) => {
      setNotifications((current) => [
        { ...notification, read: false },
        ...current,
      ].slice(0, 20))
    })

    return () => {
      socket.emit('leave-user', user.id)
      socket.disconnect()
    }
  }, [user?.id])

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
  }

  return (
    <header className="app-header px-5 md:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, lessons, topics..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/student/courses?search=${encodeURIComponent(searchQuery.trim())}`)
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-800 border border-black/10 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to twilight theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to twilight theme'}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb">
                {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </span>
            </span>
            <span className="theme-toggle-label">{isDark ? 'Mist' : 'Light'}</span>
          </button>

          <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((current) => !current)
              setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
            }}
            className="icon-button relative"
            aria-label="Open notifications"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {notifications.some((notification) => !notification.read) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          {showNotifications && (
            <div className="notification-panel absolute right-0 mt-2 w-80 rounded-xl py-2 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                <div>
                  <p className="font-extrabold text-gray-900 dark:text-white">Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Live updates from your learning journey</p>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">You are all caught up</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">New learning updates will appear here.</p>
                  </div>
                ) : notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => {
                      setShowNotifications(false)
                      if (notification.action) navigate(getNotificationPath(notification.action))
                    }}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-teal-50 transition-colors"
                  >
                    <span className="notification-icon flex items-center justify-center w-9 h-9 rounded-lg shrink-0">
                      {getNotificationIcon(notification.icon)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-gray-900 dark:text-white">{notification.title}</span>
                      <span className="block text-xs text-gray-600 dark:text-gray-300 mt-0.5">{notification.message}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="user-menu-trigger flex items-center gap-3 pl-4 border-l border-black/10 dark:border-gray-700 hover:bg-white/60 dark:hover:bg-gray-700 rounded-lg px-4 py-2 transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full ${generateColor(user?.name || 'User')} flex items-center justify-center text-white font-medium`}>
                {getInitials(user?.name || 'User')}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    navigate('/student/profile')
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    navigate('/student/settings')
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function getNotificationIcon(type) {
  const icons = {
    'check-circle': CheckCircle,
    trophy: Trophy,
    award: Award,
    'book-open': BookOpen,
    'alert-circle': AlertCircle,
    megaphone: Megaphone,
    star: Star,
    'user-plus': UserPlus,
    flame: Flame,
  }
  const Icon = icons[type] || Bell
  return <Icon className="w-4 h-4 text-primary-600" />
}

function getNotificationPath(action) {
  const paths = {
    '/dashboard': '/student',
    '/courses': '/student/courses',
    '/analytics': '/student/analytics',
    '/profile': '/student/profile',
    '/weakness-analysis': '/student/weakness-analysis',
    '/teacher': '/teacher',
  }
  return paths[action] || (action.startsWith('/student') ? action : `/student${action}`)
}
