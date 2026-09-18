import { useState, useEffect } from 'react'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react'
import { adminAPI } from '../../lib/api'

export default function AdminPanel() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeUsers: 0,
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '120ms',
    errors: 0,
  })

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
      ])
      const platformStats = statsResponse.data?.stats || {}
      setStats({
        totalUsers: platformStats.totalUsers || 0,
        totalCourses: platformStats.totalCourses || 0,
        totalRevenue: 0,
        activeUsers: platformStats.activeUsers || 0,
      })
      setRecentUsers((usersResponse.data?.users || []).slice(0, 8).map((adminUser) => ({
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        status: 'active',
        joined: new Date(adminUser.createdAt).toLocaleDateString(),
      })))
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage users, courses, and system settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['overview', 'users', 'courses', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="blue" />
            <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} color="green" />
            <StatCard icon={TrendingUp} label="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} color="purple" />
            <StatCard icon={Users} label="Active Users" value={stats.activeUsers} color="orange" />
          </div>

          {/* System Health */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              System Health
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-lg font-semibold text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {systemHealth.status}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{systemHealth.uptime}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{systemHealth.responseTime}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Errors (24h)</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{systemHealth.errors}</p>
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Joined</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="badge bg-gray-100 text-gray-700 capitalize">{user.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${
                          user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.joined}</td>
                      <td className="py-3 px-4">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>
            <button className="btn-primary">Add User</button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 py-8 text-center">
            User management interface would go here
          </p>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Course Management</h2>
            <button className="btn-primary">Add Course</button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 py-8 text-center">
            Course management interface would go here
          </p>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Settings
          </h2>
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">General Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Site Maintenance Mode</span>
                  <button className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">New User Registration</span>
                  <button className="w-12 h-6 bg-primary-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">AI Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">LLM API Key</label>
                  <input type="password" value="sk-xxxxxxxxxxxx" className="input-field" readOnly />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">AI Model</label>
                  <select className="input-field">
                    <option>GPT-4</option>
                    <option>GPT-3.5 Turbo</option>
                    <option>Claude</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
