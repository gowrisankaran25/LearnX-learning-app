import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit2, 
  Save, 
  X, 
  Bell, 
  BookOpen, 
  CheckCircle, 
  Flame, 
  Star,
  TrendingUp,
  Award
} from 'lucide-react'
import { userAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

export default function Profile() {
  const { updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState({
    name: 'Student',
    email: '',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    role: 'Student',
    bio: 'Passionate learner interested in technology and programming.',
    joinedDate: new Date().toISOString(),
    learningGoals: ['Master Python', 'Learn React', 'Build AI projects'],
    preferences: {
      emailNotifications: true,
      pushNotifications: false,
      dailyReminders: true,
      language: 'english'
    },
    stats: {
      coursesEnrolled: 0,
      lessonsCompleted: 0,
      averageScore: 0,
      studyStreak: 0,
      level: 1,
      xp: 0,
      xpNextLevel: 1000
    }
  })
  const [tempUser, setTempUser] = useState({ ...user })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const res = await userAPI.getProfile()
      const u = res.data?.user
      if (u) {
        const level = u.gamification?.level || 1
        const xp = u.gamification?.xp || 0
        const xpNextLevel = Math.max(xp + 200, level * 500)

        const profileData = {
          name: u.name || 'Student',
          email: u.email || '',
          phone: u.phone || '+1 (555) 234-5678',
          location: u.location || 'San Francisco, CA',
          role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Student',
          bio: u.bio || 'Passionate learner interested in technology and programming.',
          joinedDate: u.createdAt || new Date().toISOString(),
          learningGoals: u.learningGoals?.length ? u.learningGoals : ['Master Java', 'Understand DBMS', 'Computer Networks'],
          preferences: {
            emailNotifications: u.preferences?.emailNotifications ?? true,
            pushNotifications: u.preferences?.pushNotifications ?? false,
            dailyReminders: u.preferences?.dailyReminders ?? true,
            language: u.preferences?.language || 'english'
          },
          stats: {
            coursesEnrolled: u.enrolledCourses?.length || 0,
            lessonsCompleted: u.completedLessons?.length || 0,
            averageScore: u.learningDNA?.averageQuizScore || 0,
            studyStreak: u.gamification?.streak || 0,
            level: level,
            xp: xp,
            xpNextLevel: xpNextLevel
          }
        }
        setUser(profileData)
        setTempUser(profileData)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile details')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await userAPI.updateProfile({
        name: tempUser.name,
        bio: tempUser.bio,
        preferences: tempUser.preferences
      })
      setUser({ ...tempUser })
      updateUser({
        name: response.data?.user?.name || tempUser.name,
        bio: response.data?.user?.bio || tempUser.bio,
      })
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error(error.response?.data?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setTempUser({ ...user })
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const xpProgress = Math.min(100, Math.round((user.stats.xp / (user.stats.xpNextLevel || 1)) * 100))

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and learning preferences
          </p>
        </div>
        {!editing ? (
          <button 
            onClick={() => setEditing(true)} 
            className="btn-primary flex items-center gap-2 shadow-sm hover:shadow"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={handleCancel} 
              disabled={saving}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Gamified Profile Card & Stats */}
        <div className="md:col-span-1 space-y-6">
          {/* Main User Card */}
          <div className="card text-center relative overflow-hidden pb-8 pt-10">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-600 to-accent-600"></div>
            
            <div className="relative w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center text-3xl font-bold text-primary-600 dark:text-primary-400 shadow-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-amber-400 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-sm">
                <Star className="w-4 h-4 text-white fill-current" />
              </div>
            </div>
            
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              {user.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-0.5">
              {user.role}
            </p>
            
            <div className="mt-8 px-6 text-left space-y-1">
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-base text-gray-900 dark:text-white">
                  Level {user.stats.level}
                </span>
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {user.stats.xp.toLocaleString()} XP
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-1000 shadow-sm" 
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-right text-gray-500 dark:text-gray-400 font-medium">
                {user.stats.xpNextLevel.toLocaleString()} XP to Next Level
              </p>
            </div>
          </div>

          {/* User Learning Stats Card */}
          <div className="card space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Your Stats
            </h3>
            <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2 font-medium">
                <BookOpen className="w-4 h-4 text-blue-500" /> Courses
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {user.stats.coursesEnrolled}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 text-green-500" /> Lessons
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {user.stats.lessonsCompleted}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2 font-medium">
                <TrendingUp className="w-4 h-4 text-purple-500" /> Quiz Average
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {user.stats.averageScore}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2 font-medium">
                <Flame className="w-4 h-4 text-orange-500" /> Study Streak
              </span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {user.stats.studyStreak} days
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Info & Preferences */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Personal Information
            </h2>
            <div className="space-y-5">
              <InfoRow 
                label="Name" 
                value={editing ? tempUser.name : user.name}
                icon={User}
                editing={editing}
                onChange={(e) => setTempUser({ ...tempUser, name: e.target.value })}
              />
              <InfoRow 
                label="Email" 
                value={editing ? tempUser.email : user.email}
                icon={Mail}
                editing={editing}
                onChange={(e) => setTempUser({ ...tempUser, email: e.target.value })}
                readOnly={true}
              />
              <InfoRow 
                label="Phone" 
                value={editing ? tempUser.phone : user.phone}
                icon={Phone}
                editing={editing}
                onChange={(e) => setTempUser({ ...tempUser, phone: e.target.value })}
              />
              <InfoRow 
                label="Location" 
                value={editing ? tempUser.location : user.location}
                icon={MapPin}
                editing={editing}
                onChange={(e) => setTempUser({ ...tempUser, location: e.target.value })}
              />
              <InfoRow 
                label="Member Since" 
                value={new Date(user.joinedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                icon={Calendar}
                readOnly={true}
              />
              <div className="pt-2 flex items-start gap-4">
                <Edit2 className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  {editing ? (
                    <textarea
                      value={tempUser.bio}
                      onChange={(e) => setTempUser({ ...tempUser, bio: e.target.value })}
                      className="input-field min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/60 p-4 rounded-lg leading-relaxed">
                      {user.bio || 'No bio provided yet.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-500" />
              Notification Preferences
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <PreferenceItem
                label="Email Notifications"
                description="Receive learning updates via email"
                checked={editing ? tempUser.preferences.emailNotifications : user.preferences.emailNotifications}
                onChange={(checked) => setTempUser({
                  ...tempUser,
                  preferences: { ...tempUser.preferences, emailNotifications: checked }
                })}
                editing={editing}
              />
              <PreferenceItem
                label="Push Notifications"
                description="Receive browser alerts and tips"
                checked={editing ? tempUser.preferences.pushNotifications : user.preferences.pushNotifications}
                onChange={(checked) => setTempUser({
                  ...tempUser,
                  preferences: { ...tempUser.preferences, pushNotifications: checked }
                })}
                editing={editing}
              />
              <PreferenceItem
                label="Daily Reminders"
                description="Get reminded to maintain streak daily"
                checked={editing ? tempUser.preferences.dailyReminders : user.preferences.dailyReminders}
                onChange={(checked) => setTempUser({
                  ...tempUser,
                  preferences: { ...tempUser.preferences, dailyReminders: checked }
                })}
                editing={editing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, icon: Icon, editing, onChange, readOnly }) {
  return (
    <div className="flex items-center gap-4">
      <Icon className="w-5 h-5 text-primary-500 dark:text-primary-400 shrink-0" />
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-32 shrink-0">
          {label}
        </label>
        {editing && !readOnly ? (
          <input
            value={value || ''}
            onChange={onChange}
            className="input-field flex-1"
          />
        ) : (
          <p className="text-gray-900 dark:text-gray-100 font-medium flex-1">
            {value || '—'}
          </p>
        )}
      </div>
    </div>
  )
}

function PreferenceItem({ label, description, checked, onChange, editing }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600/60 transition-colors">
      <div className="pr-2">
        <p className="font-bold text-gray-900 dark:text-white text-sm">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={() => editing && onChange(!checked)}
        disabled={!editing}
        className={`w-12 h-6 rounded-full relative transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        } ${!editing ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
            checked ? 'right-0.5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}
