import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle,
  ArrowLeft,
  Share2,
  Bookmark
} from 'lucide-react'
import { courseAPI, userAPI } from '../../lib/api'
import { formatTime, calculateProgress } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function CourseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)

  useEffect(() => {
    loadCourse()
  }, [id])

  const loadCourse = async () => {
    try {
      const [res, profileRes] = await Promise.all([
        courseAPI.getById(id),
        userAPI.getProfile(),
      ])
      const c = res.data?.course;
      if (!c) return;

      const formattedCourse = {
        id: c._id,
        title: c.title,
        instructor: c.instructor?.name || 'Instructor',
        instructorBio: c.instructor?.bio || 'Course Instructor',
        category: c.category,
        level: c.level,
        duration: c.duration,
        lessons: c.lessons?.length || 0,
        students: c.enrolledStudents?.length || 0,
        rating: c.rating?.average || 0,
        reviews: c.rating?.count || 0,
        image: c.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        description: c.description,
        whatYouLearn: c.whatYouLearn || [],
        curriculum: [
          {
            id: 1,
            title: 'Course Content',
            lessons: c.lessons?.map(l => ({
              id: l._id,
              title: l.title,
              duration: Math.round((l.videoDuration || 900) / 60),
              completed: false // Would check against user progress in real app
            })) || []
          }
        ],
        quizzes: c.quizzes?.map(quiz => ({
          id: quiz._id,
          title: quiz.title,
          duration: Math.round((quiz.duration || 600) / 60),
          questions: quiz.questions?.length || 0,
        })) || [],
        prerequisites: c.prerequisites || [],
      }
      setCourse(formattedCourse)
      const enrolledCourses = profileRes.data?.user?.enrolledCourses || []
      setEnrolled(enrolledCourses.some((enrolledCourse) => (
        (enrolledCourse._id || enrolledCourse).toString() === c._id.toString()
      )))
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    try {
      const response = await courseAPI.enroll(id)
      setEnrolled(true)
      toast.success(response.data?.message || 'Successfully enrolled in course!')
    } catch (error) {
      console.error('Error enrolling:', error)
      if (error.response?.status === 400 && error.response?.data?.message === 'Already enrolled in this course') {
        setEnrolled(true)
      }
      toast.error(error.response?.data?.message || 'Unable to enroll in this course')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!course) {
    return <div>Course not found</div>
  }

  const completedLessons = course.curriculum.flatMap(section => section.lessons).filter(l => l.completed).length
  const totalLessons = course.curriculum.flatMap(section => section.lessons).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <button
        onClick={() => navigate('/student/courses')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Courses
      </button>

      {/* Course Hero */}
      <div className="card overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/3">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          <div className="md:w-1/3 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge bg-primary-100 text-primary-700">{course.category}</span>
              <span className="badge bg-gray-100 text-gray-700">{course.level}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {course.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{course.description}</p>
            
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{course.rating}</span>
                <span className="text-gray-600 dark:text-gray-400">({course.reviews.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                {course.students.toLocaleString()} students
              </div>
            </div>

            {enrolled ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-semibold">{calculateProgress(completedLessons, totalLessons)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${calculateProgress(completedLessons, totalLessons)}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => totalLessons > 0 && navigate(`/student/lessons/${course.curriculum[0].lessons[0].id}`)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Continue Learning
                </button>
              </div>
            ) : (
              <button onClick={handleEnroll} className="btn-primary w-full">
                Enroll Now
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* What You'll Learn */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              What You'll Learn
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {course.whatYouLearn.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Prerequisites
            </h2>
            <ul className="space-y-2">
              {course.prerequisites.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-primary-500">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructor */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Instructor
            </h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {course.instructor.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{course.instructor}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{course.instructorBio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Curriculum */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Course Content
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalLessons} lessons • {formatTime(course.duration)}
            </span>
          </div>

          <div className="space-y-4">
            {course.curriculum.map((section) => (
              <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {section.title}
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {section.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => navigate(`/student/lessons/${lesson.id}`)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {lesson.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Play className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {lesson.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(lesson.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {course.quizzes.length > 0 && (
              <div className="border border-[#f3c969] rounded-lg overflow-hidden">
                <div className="bg-[#fff7d6] px-4 py-3 font-semibold text-[#6e5512]">
                  Practice Tests
                </div>
                <div className="divide-y divide-[#f3c969]/40">
                  {course.quizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{quiz.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {quiz.questions} questions • {formatTime(quiz.duration)}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                        className="btn-primary text-xs px-3 py-2 whitespace-nowrap"
                      >
                        Take Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
