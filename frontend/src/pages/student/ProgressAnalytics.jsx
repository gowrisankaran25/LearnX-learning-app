import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  Sparkles,
  BookOpen
} from 'lucide-react'

export default function ProgressAnalytics() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const weeklyStudyData = [
    { day: 'Mon', hours: 2.5, percent: 50 },
    { day: 'Tue', hours: 3.5, percent: 70 },
    { day: 'Wed', hours: 1.5, percent: 30 },
    { day: 'Thu', hours: 4.5, percent: 90 },
    { day: 'Fri', hours: 3.0, percent: 60 },
    { day: 'Sat', hours: 5.0, percent: 100 },
    { day: 'Sun', hours: 2.0, percent: 40 },
  ]

  const subjectPerformance = [
    { name: 'Java Programming', score: 82, color: 'text-green-500', icon: '🟢' },
    { name: 'DBMS', score: 61, color: 'text-yellow-500', icon: '🟡' },
    { name: 'Computer Networks', score: 42, color: 'text-red-500', icon: '🔴' },
    { name: 'Python', score: 74, color: 'text-green-500', icon: '🟢' },
  ]

  const aiInsights = [
    'Your Java performance improved by 14% over the last week.',
    'You struggle most with networking concepts, specifically protocols.',
    'Your best learning time is between 7 PM and 9 PM.',
    'Revision improves your quiz scores significantly (avg +18%).'
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          <BarChart3 className="w-8 h-8 text-primary-500" />
          Progress Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning journey and get AI-driven insights on your habits.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Weekly Study Time */}
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Weekly Study Time
            </h2>
            <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              22 hrs total
            </span>
          </div>

          <div className="space-y-4">
            {weeklyStudyData.map((data) => (
              <div key={data.day} className="flex items-center gap-4">
                <span className="w-10 text-sm font-medium text-gray-600 dark:text-gray-400 font-mono">
                  {data.day}
                </span>
                <div className="flex-1 flex items-center">
                  <div 
                    className="h-6 bg-primary-500 rounded-r-md transition-all duration-1000 ease-out min-w-[4px]" 
                    style={{ width: `${data.percent}%` }}
                  ></div>
                </div>
                <span className="w-16 text-right text-sm font-medium text-gray-800 dark:text-gray-200">
                  {data.hours}h
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* Subject Performance */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-gray-500" />
              Subject Performance
            </h2>
            <div className="space-y-4">
              {subjectPerformance.map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{sub.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{sub.score}%</span>
                    <span className="text-xl">{sub.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800/30">
            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-purple-500" />
              AI Learning Insights
            </h2>
            <ul className="space-y-4">
              {aiInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 shrink-0"></div>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    {insight}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
