import { useState, useEffect } from 'react'
import { 
  Award, 
  Trophy, 
  Flame, 
  Star, 
  CheckCircle, 
  Lock, 
  Sparkles, 
  BookOpen, 
  Zap, 
  TrendingUp, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import { userAPI } from '../../lib/api'
import { Link } from 'react-router-dom'

export default function Achievements() {
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'unlocked' | 'locked'
  const [gamification, setGamification] = useState({
    xp: 2450,
    level: 12,
    streak: 7,
    longestStreak: 14
  })
  const [badges, setBadges] = useState([])

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      const res = await userAPI.getAchievements()
      if (res.data?.success) {
        setGamification(res.data.gamification || {
          xp: 2450,
          level: 12,
          streak: 7,
          longestStreak: 14
        })
        if (res.data.badges && res.data.badges.length > 0) {
          setBadges(res.data.badges)
        } else {
          setBadges(getDefaultBadges())
        }
      } else {
        setBadges(getDefaultBadges())
      }
    } catch (error) {
      console.warn('Using default badge data:', error)
      setBadges(getDefaultBadges())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultBadges = () => [
    {
      id: '1',
      name: '7-Day Streak Master',
      description: 'Logged in and studied for 7 consecutive days',
      icon: 'flame',
      category: 'streak',
      rarity: 'rare',
      xpReward: 250,
      unlocked: true,
      unlockedAt: '3 days ago',
      progress: 100
    },
    {
      id: '2',
      name: 'Quiz Champion',
      description: 'Scored 100% on a course quiz',
      icon: 'trophy',
      category: 'achievement',
      rarity: 'epic',
      xpReward: 300,
      unlocked: true,
      unlockedAt: 'Yesterday',
      progress: 100
    },
    {
      id: '3',
      name: 'Java Explorer',
      description: 'Completed your first 2 Java lessons',
      icon: 'book',
      category: 'completion',
      rarity: 'common',
      xpReward: 150,
      unlocked: true,
      unlockedAt: '5 days ago',
      progress: 100
    },
    {
      id: '4',
      name: 'High Achiever',
      description: 'Accumulate more than 2,000 XP',
      icon: 'award',
      category: 'achievement',
      rarity: 'legendary',
      xpReward: 500,
      unlocked: true,
      unlockedAt: '1 week ago',
      progress: 100
    },
    {
      id: '5',
      name: '14-Day Consistency Guru',
      description: 'Maintain your study streak for 14 continuous days',
      icon: 'zap',
      category: 'streak',
      rarity: 'epic',
      xpReward: 400,
      unlocked: false,
      progress: 50,
      progressText: '7 / 14 days'
    },
    {
      id: '6',
      name: 'Course Graduate',
      description: 'Complete 100% of any enrolled course',
      icon: 'star',
      category: 'completion',
      rarity: 'rare',
      xpReward: 350,
      unlocked: false,
      progress: 72,
      progressText: '72% completed'
    },
    {
      id: '7',
      name: 'AI Tutor Collaborator',
      description: 'Ask 10 questions to the AI Learning Tutor',
      icon: 'sparkles',
      category: 'skill',
      rarity: 'common',
      xpReward: 200,
      unlocked: false,
      progress: 40,
      progressText: '4 / 10 questions'
    },
    {
      id: '8',
      name: 'Grandmaster of Knowledge',
      description: 'Reach Level 20 in the LearnX Platform',
      icon: 'trophy',
      category: 'achievement',
      rarity: 'legendary',
      xpReward: 1000,
      unlocked: false,
      progress: 60,
      progressText: 'Level 12 / 20'
    }
  ]

  const getRarityBadge = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30'
      case 'epic':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30'
      case 'rare':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      default:
        return 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/30'
    }
  }

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-8 h-8 text-orange-500" />
      case 'trophy':
        return <Trophy className="w-8 h-8 text-amber-500" />
      case 'book':
        return <BookOpen className="w-8 h-8 text-blue-500" />
      case 'zap':
        return <Zap className="w-8 h-8 text-yellow-500" />
      case 'sparkles':
        return <Sparkles className="w-8 h-8 text-purple-500" />
      case 'star':
        return <Star className="w-8 h-8 text-yellow-400" />
      default:
        return <Award className="w-8 h-8 text-primary-500" />
    }
  }

  const unlockedCount = badges.filter(b => b.unlocked).length
  const totalCount = badges.length

  const filteredBadges = badges.filter(b => {
    if (filter === 'unlocked') return b.unlocked
    if (filter === 'locked') return !b.unlocked
    return true
  })

  const xpNextLevel = gamification.level * 500
  const xpProgress = Math.min(100, Math.round((gamification.xp / (xpNextLevel || 1)) * 100))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Award className="w-8 h-8 text-primary-500" />
            Achievements & Badges
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Celebrate your milestones, unlock rare badges, and level up your skills
          </p>
        </div>
        <Link 
          to="/student/courses"
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          Earn More XP <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Gamification Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Level Card */}
        <div className="card p-5 border-l-4 border-l-primary-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Current Level
            </span>
            <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              Level {gamification.level}
            </h3>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-3">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-700" 
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5 block text-right">
              {gamification.xp} / {xpNextLevel} XP
            </span>
          </div>
        </div>

        {/* Total XP Card */}
        <div className="card p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total XP
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {gamification.xp.toLocaleString()} <span className="text-lg font-semibold text-amber-500">XP</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Earned across courses, quizzes & streaks
            </p>
          </div>
        </div>

        {/* Study Streak Card */}
        <div className="card p-5 border-l-4 border-l-orange-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Active Streak
            </span>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
              <Flame className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {gamification.streak} <span className="text-lg text-gray-700 dark:text-gray-300 font-semibold">Days</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Personal best: {gamification.longestStreak} days
            </p>
          </div>
        </div>

        {/* Badges Count Card */}
        <div className="card p-5 border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Badges Collected
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {unlockedCount} <span className="text-lg font-normal text-gray-400">/ {totalCount}</span>
            </h3>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-3">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-700" 
                style={{ width: `${Math.round((unlockedCount / (totalCount || 1)) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5 block text-right">
              {Math.round((unlockedCount / (totalCount || 1)) * 100)}% Unlocked
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Badges ({totalCount})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              filter === 'unlocked'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              filter === 'locked'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Locked ({totalCount - unlockedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={`card relative overflow-hidden flex flex-col justify-between transition-all duration-300 border ${
              badge.unlocked
                ? 'hover:shadow-lg border-gray-200 dark:border-gray-700'
                : 'opacity-70 bg-gray-50/70 dark:bg-gray-800/50 border-dashed border-gray-300 dark:border-gray-700'
            }`}
          >
            <div>
              {/* Badge Header: Rarity & XP */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getRarityBadge(badge.rarity)}`}>
                  {badge.rarity}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                  +{badge.xpReward} XP
                </span>
              </div>

              {/* Icon Container */}
              <div className="flex justify-center my-4">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center relative shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-purple-900/30 border border-primary-200 dark:border-primary-800'
                    : 'bg-gray-200 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600'
                }`}>
                  {badge.unlocked ? (
                    getBadgeIcon(badge.icon)
                  ) : (
                    <Lock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  )}
                  {badge.unlocked && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white shadow">
                      <CheckCircle className="w-4 h-4 fill-current" />
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center mt-2 mb-4">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {badge.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {badge.description}
                </p>
              </div>
            </div>

            {/* Bottom Status / Progress */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700/70 mt-2">
              {badge.unlocked ? (
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Unlocked {badge.unlockedAt || ''}</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    <span>In Progress</span>
                    <span>{badge.progressText || `${badge.progress || 0}%`}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-primary-500 h-1.5 rounded-full" 
                      style={{ width: `${badge.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
