import { useState, useEffect } from 'react'
import { Trophy, Medal, Crown, TrendingUp, Award } from 'lucide-react'
import { leaderboardAPI } from '../../lib/api'
import { getInitials, generateColor } from '../../lib/utils'

export default function Leaderboard() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('weekly')
  const [leaderboard, setLeaderboard] = useState({
    global: [],
    course: [],
    userRank: null,
  })

  useEffect(() => {
    loadLeaderboard()
  }, [period])

  const loadLeaderboard = async () => {
    try {
      const res = await leaderboardAPI.getGlobal();
      const globalData = res.data?.leaderboard || [];

      const formattedGlobal = globalData.map(u => ({
        id: u._id,
        name: u.name,
        xp: u.gamification?.xp || 0,
        courses: 0, // Not provided by this endpoint currently
        streak: u.gamification?.streak || 0,
        avatar: null,
      }));

      const mockCourseLeaderboard = [
        { id: 1, name: 'Alex Johnson', score: 98, lessons: 24, quizzes: 8, avatar: null },
        { id: 2, name: 'Sarah Williams', score: 95, lessons: 23, quizzes: 8, avatar: null },
        { id: 3, name: 'Michael Chen', score: 92, lessons: 22, quizzes: 7, avatar: null },
        { id: 4, name: 'Emma Davis', score: 90, lessons: 21, quizzes: 7, avatar: null },
        { id: 5, name: 'James Wilson', score: 88, lessons: 20, quizzes: 6, avatar: null },
      ];

      setLeaderboard({
        global: formattedGlobal.length ? formattedGlobal : mockCourseLeaderboard, // Fallback to mock if empty
        course: mockCourseLeaderboard,
        userRank: {
          global: 1, // Calculate based on actual rank later
          course: 8,
          xp: 2450,
          percentile: 85,
        },
      });
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400">#{rank}</span>
  }

  const getRankBackground = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800'
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/20 dark:to-slate-800/20 border-gray-200 dark:border-gray-700'
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800'
    return ''
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            See how you rank among other learners
          </p>
        </div>
        <div className="flex gap-2">
          {['weekly', 'monthly', 'alltime'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                period === p
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {p === 'alltime' ? 'All Time' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Your Rank Card */}
      <div className="card mist-contrast-panel bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              #{leaderboard.userRank.global}
            </div>
            <div>
              <p className="text-lg font-semibold">Your Global Rank</p>
              <p className="text-sm opacity-90">
                Top {leaderboard.userRank.percentile}% of learners
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{leaderboard.userRank.xp.toLocaleString()}</p>
            <p className="text-sm opacity-90">Total XP</p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4">
        {leaderboard.global.slice(0, 3).map((user, index) => {
          const rank = index + 1
          const heights = ['h-32', 'h-40', 'h-36']
          const order = [1, 0, 2] // 2nd, 1st, 3rd place order
          const actualIndex = order.indexOf(index)
          
          return (
            <div
              key={user.id}
              className={`flex flex-col items-center ${actualIndex === 1 ? 'order-1' : ''}`}
            >
              <div className={`w-20 h-20 rounded-full ${generateColor(user.name)} flex items-center justify-center text-white text-xl font-bold mb-2`}>
                {getInitials(user.name)}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-center">{user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.xp.toLocaleString()} XP</p>
              <div className={`mt-4 w-full ${heights[index]} bg-gradient-to-t ${
                rank === 1 ? 'from-yellow-400 to-yellow-300' : rank === 2 ? 'from-gray-400 to-gray-300' : 'from-amber-600 to-amber-500'
              } rounded-t-lg flex items-end justify-center pb-2`}>
                {getRankIcon(rank)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Global Leaderboard */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Global Leaderboard
        </h2>
        <div className="space-y-2">
          {leaderboard.global.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                getRankBackground(index + 1) || 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <div className={`w-10 h-10 rounded-full ${generateColor(user.name)} flex items-center justify-center text-white font-medium`}>
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.courses} courses • {user.streak} day streak
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">{user.xp.toLocaleString()} XP</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{Math.floor(Math.random() * 500)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Leaderboard */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-500" />
          Course Leaderboard - Java Programming
        </h2>
        <div className="space-y-2">
          {leaderboard.course.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                getRankBackground(index + 1) || 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <div className={`w-10 h-10 rounded-full ${generateColor(user.name)} flex items-center justify-center text-white font-medium`}>
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.lessons} lessons • {user.quizzes} quizzes
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">{user.score}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Course Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
