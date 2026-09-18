import { useEffect, useState } from 'react'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Sun, 
  Shield, 
  Key, 
  Globe, 
  Save, 
  Check 
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import toast from 'react-hot-toast'
import { userAPI } from '../../lib/api'

export default function Settings() {
  const { isDark, toggleTheme } = useTheme()
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushAlerts, setPushAlerts] = useState(false)
  const [streakReminders, setStreakReminders] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)
  const [language, setLanguage] = useState('English')

  useEffect(() => {
    userAPI.getProfile().then((response) => {
      const preferences = response.data?.user?.preferences
      if (!preferences) return
      setEmailAlerts(preferences.emailNotifications ?? true)
      setPushAlerts(preferences.pushNotifications ?? false)
      setStreakReminders(preferences.dailyReminders ?? true)
      setLanguage(preferences.language || 'English')
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    try {
      await userAPI.updateProfile({
        preferences: {
          emailNotifications: emailAlerts,
          pushNotifications: pushAlerts,
          dailyReminders: streakReminders,
          language,
        },
      })
      toast.success('Settings updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary-500" />
          Settings & Preferences
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize your interface, study alerts, and account preferences
        </p>
      </div>

      {/* Theme Settings */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {isDark ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
          Appearance & Theme
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Switch between light and dark modes for optimal viewing comfort.
        </p>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600/60">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Currently set to {isDark ? 'Dark Theme' : 'Light Theme'}</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-14 h-7 rounded-full relative transition-colors ${
              isDark ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full absolute top-0.5 transition-all shadow flex items-center justify-center text-gray-700 ${
                isDark ? 'right-0.5' : 'left-0.5'
              }`}
            >
              {isDark ? <Moon className="w-3.5 h-3.5 text-primary-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </div>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-500" />
          Study Notifications
        </h2>
        <div className="space-y-3">
          <SettingToggle
            title="Email Notifications"
            description="Receive weekly summaries and assignment notifications"
            checked={emailAlerts}
            onChange={setEmailAlerts}
          />
          <SettingToggle
            title="Push Notifications"
            description="Receive real-time updates about quizzes and achievements"
            checked={pushAlerts}
            onChange={setPushAlerts}
          />
          <SettingToggle
            title="Daily Streak Reminders"
            description="Get notified to practice before your daily streak expires"
            checked={streakReminders}
            onChange={setStreakReminders}
          />
          <SettingToggle
            title="Audio & Sound Effects"
            description="Play cheerful chimes upon quiz completion and level up"
            checked={soundEffects}
            onChange={setSoundEffects}
          />
        </div>
      </div>

      {/* Language */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-500" />
          Language & Region
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600/60">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Platform Language</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Choose the language used for interface and AI tutor responses</p>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field sm:w-48 bg-white dark:bg-gray-800"
          >
            <option value="English">English (US)</option>
            <option value="Spanish">Español</option>
            <option value="French">Français</option>
            <option value="German">Deutsch</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow"
        >
          <Save className="w-4 h-4" />
          Save All Settings
        </button>
      </div>
    </div>
  )
}

function SettingToggle({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600/60 transition-colors">
      <div>
        <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
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
