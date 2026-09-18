import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Flame, 
  Target, 
  AlertTriangle,
  ArrowRight,
  Play,
  CheckCircle,
  XCircle,
  Sparkles,
  ChevronRight,
  Award
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { userAPI, courseAPI } from '../../lib/api'
import { calculateProgress, formatTime } from '../../lib/utils'

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    lessonsCompleted: 0,
    lessonsTotal: 0,
    quizScore: 0,
    quizTrend: 0,
    streak: 0,
    xp: 0,
    level: 0,
    coursesEnrolledTrend: 0
  })
  const [learningPlan, setLearningPlan] = useState([])
  const [weakTopics, setWeakTopics] = useState([])
  const [recentCourses, setRecentCourses] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [progressRes, weaknessesRes, recommendationsRes, coursesRes] = await Promise.all([
        userAPI.getProgress(),
        userAPI.getWeaknesses(),
        userAPI.getRecommendations(),
        courseAPI.getAll()
      ]);

      const progressData = progressRes.data?.progress || {};
      setStats({
        coursesEnrolled: progressData.totalCourses || 0,
        coursesEnrolledTrend: 1, // Mock trend
        lessonsCompleted: progressData.completedLessons || 0,
        lessonsTotal: progressData.totalCourses * 10 || 10, // Approximation
        quizScore: progressData.avgQuizScore || 0,
        quizTrend: 5, // Mock trend
        streak: progressData.streak || 0,
        xp: progressData.xp || 0,
        level: progressData.level || 1
      });
      
      const weaknesses = weaknessesRes.data?.weakAreas || [];
      setWeakTopics(weaknesses.map(w => ({
        name: w.topic,
        score: w.score,
        status: w.priority === 'high' ? 'critical' : (w.priority === 'medium' ? 'warning' : 'good')
      })));

      // Mock learning plan for now or derive from recommendations
      const recs = recommendationsRes.data?.recommendations || [];
      setLearningPlan(recs.map((r, i) => ({
        id: i,
        title: r.title || r.topic || 'Recommended Topic',
        topic: r.reason,
        progress: Math.floor(Math.random() * 100),
        duration: 15 + i * 5
      })));

      const coursesData = coursesRes.data?.courses || [];
      setRecentCourses(coursesData.slice(0, 2).map(c => ({
        id: c._id,
        title: c.title,
        progress: Math.floor(Math.random() * 100), // Should ideally come from backend
        lessons: c.lessons?.length || 0,
        totalLessons: c.lessons?.length || 0,
        level: c.level
      })));

    } catch (error) {
      console.error('Error loading dashboard:', error)
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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Good evening, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Continue your personalized learning journey
          </p>
        </div>
        <div className="flex flex-col items-end">
           <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-4 py-2 rounded-full shadow-sm border border-orange-200">
             <Flame className="w-5 h-5 fill-current" />
             <span className="font-bold">{stats.streak} Day Streak</span>
           </div>
        </div>
      </div>

      {/* Gamified Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Courses Enrolled"
          value={stats.coursesEnrolled}
          subtext={`↑ ${stats.coursesEnrolledTrend} this month`}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Lessons Completed"
          value={`${stats.lessonsCompleted} / ${stats.lessonsTotal}`}
          subtext={`${Math.round((stats.lessonsCompleted / stats.lessonsTotal) * 100)}%`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Average Quiz"
          value={`${stats.quizScore}%`}
          subtext={`↑ ${stats.quizTrend}%`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="XP Points"
          value={`${stats.xp.toLocaleString()} XP`}
          subtext={`Level ${stats.level}`}
          icon={Award}
          color="orange"
        />
      </div>

      {/* Today's Learning Plan */}
      <div className="card border-primary-100 dark:border-primary-900/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-primary-500" />
              Today's Learning Plan
            </h2>
            <button
              onClick={() => navigate('/student/learning-path')}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View Full Path <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {learningPlan.map((plan, idx) => (
              <div key={plan.id} className="learning-plan-item flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{plan.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.topic}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 sm:w-1/2 justify-end">
                  <div className="flex-1 max-w-[200px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${plan.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-4 h-4" /> {plan.duration} min
                    </span>
                    <button
                      onClick={() => navigate('/student/courses')}
                      className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                    >
                      <Play className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning (Recent Courses) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Continue Learning
            </h2>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View All
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {recentCourses.map((course) => (
              <div key={course.id} className="card p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen className="w-16 h-16 text-primary-600" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">☕</span>
                  <h3 className="font-bold text-gray-900 dark:text-white">{course.title}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{course.level}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-primary-600">{course.progress}%</span>
                    <span className="text-gray-500">{course.lessons} / {course.totalLessons} Lessons</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <button className="mt-6 w-full btn-secondary py-2.5 flex items-center justify-center gap-2 font-semibold">
                  Continue Learning <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics & AI Recommendation */}
        <div className="space-y-6">
          <div className="card mist-contrast-panel bg-gradient-to-br from-indigo-900 to-purple-900 text-white border-0 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 text-white/10">
               <Sparkles className="w-24 h-24" />
             </div>
             <div className="relative z-10">
               <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                 <Sparkles className="w-5 h-5 text-yellow-300" />
                 Recommended For You
               </h3>
               <p className="text-indigo-200 text-sm mb-5">Based on your recent performance</p>
               
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                 <div className="flex items-start gap-3 mb-3">
                   <BookOpen className="w-6 h-6 text-indigo-300 shrink-0 mt-1" />
                   <div>
                     <h4 className="font-bold text-white">TCP/IP Protocols</h4>
                     <p className="text-xs text-indigo-200 mt-1">Matches your Computer Networks weakness</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between mt-4">
                   <div className="text-xs text-indigo-200">
                     Difficulty: <span className="text-yellow-300">Medium</span> • 20 min
                   </div>
                  <button
                    onClick={() => navigate('/student/courses?search=TCP%2FIP')}
                    className="bg-white text-indigo-900 text-xs font-bold py-1.5 px-3 rounded-full hover:bg-indigo-50 transition-colors"
                  >
                     Start →
                   </button>
                 </div>
               </div>
             </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Weak Topics
              </h3>
            </div>
            <div className="space-y-4">
              {weakTopics.map((topic) => (
                <div key={topic.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{topic.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      {topic.status === 'critical' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                      {topic.status === 'warning' && <span className="w-2 h-2 rounded-full bg-yellow-500"></span>}
                      {topic.status === 'good' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                      {topic.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        topic.score < 50 ? 'bg-red-500' : topic.score < 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${topic.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtext, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  }

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
  }

  return (
    <div className={`stat-card rounded-xl border p-5 ${colorClasses[color]} flex items-start justify-between`}>
      <div>
        <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
        <h3 className="text-2xl font-bold mb-1">{value}</h3>
        <p className="text-xs font-semibold opacity-75">{subtext}</p>
      </div>
      <div className={`p-2 rounded-lg bg-white/60 dark:bg-gray-700 ${iconColorClasses[color]} shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  )
}
