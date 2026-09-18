import { useState, useEffect } from 'react'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { teacherAPI, courseAPI } from '../../lib/api'

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    avgCompletion: 0,
    activeNow: 0,
  })
  const [courses, setCourses] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [weakStudents, setWeakStudents] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [coursesRes, studentsRes] = await Promise.all([
        courseAPI.getAll(),
        teacherAPI.getStudents()
      ]);

      const coursesData = coursesRes.data?.courses || [];
      const studentsData = studentsRes.data?.students || [];

      setStats({
        totalStudents: studentsData.length,
        totalCourses: coursesData.length,
        avgCompletion: 45, // Mock derived metric
        activeNow: Math.floor(studentsData.length * 0.3),
      })
      
      setCourses(coursesData.map((c, i) => ({
        id: c._id, 
        title: c.title, 
        students: c.enrolledStudents?.length || 0, 
        completion: Math.floor(Math.random() * 100), 
        rating: c.rating?.average || 0 
      })))
      
      setRecentActivity([
        { id: 1, student: studentsData[0]?.name || 'Student', action: 'completed lesson', course: coursesData[0]?.title || 'Course', time: '5 min ago' },
        { id: 2, student: studentsData[1]?.name || 'Student', action: 'submitted quiz', course: coursesData[0]?.title || 'Course', time: '12 min ago' },
      ])
      
      setWeakStudents(studentsData.filter(s => s.learningDNA?.averageQuizScore < 60).map((s, i) => ({
        id: s._id,
        name: s.name,
        course: coursesData[i % coursesData.length]?.title || 'Course',
        score: s.learningDNA?.averageQuizScore || 0,
        lastActive: '2 days ago'
      })))
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your courses and track student progress
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Course
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="blue" />
        <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} color="green" />
        <StatCard icon={TrendingUp} label="Avg Completion" value={`${stats.avgCompletion}%`} color="purple" />
        <StatCard icon={Eye} label="Active Now" value={stats.activeNow} color="orange" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Courses</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{course.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{course.students} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{course.completion}%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">completion</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Students Alert */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Students Needing Attention
            </h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {weakStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-300 font-medium">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{student.course}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">{student.score}%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{student.lastActive}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                  {activity.student.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.student}</span> {activity.action}{' '}
                    <span className="font-medium">{activity.course}</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
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
