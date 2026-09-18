import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Filter, BookOpen, Clock, Users, Star, Sparkles, TrendingUp, Play } from 'lucide-react'
import { courseAPI, userAPI } from '../../lib/api'
import { formatTime } from '../../lib/utils'

export default function CourseExplorer() {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All')

  const categories = ['All', 'Programming', 'Database', 'Networking', 'AI/ML', 'Web Development']
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '')
  }, [searchParams])

  useEffect(() => {
    filterCourses()
  }, [searchQuery, selectedCategory, selectedLevel, courses])

  const loadCourses = async () => {
    try {
      const [coursesRes, profileRes] = await Promise.all([
        courseAPI.getAll(),
        userAPI.getProfile() // Assuming we import userAPI at the top
      ]);
      
      const enrolledIds = profileRes.data?.user?.enrolledCourses?.map(c => c._id) || [];
      const backendCourses = coursesRes.data?.courses || [];
      
      const formattedCourses = backendCourses.map(course => ({
        id: course._id,
        title: course.title,
        instructor: course.instructor?.name || 'Instructor',
        category: course.category,
        level: course.level,
        duration: course.duration,
        lessons: course.lessons?.length || 0,
        students: course.enrolledStudents?.length || 0,
        rating: course.rating?.average || 0,
        reviews: course.rating?.count || 0,
        image: course.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
        description: course.description,
        aiMatch: Math.floor(Math.random() * 20) + 80, // Mock AI match logic for now
        enrolled: enrolledIds.includes(course._id),
        progress: enrolledIds.includes(course._id) ? Math.floor(Math.random() * 100) : 0 // Would ideally use getProgress
      }));

      setCourses(formattedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  }

  const filterCourses = () => {
    let filtered = courses

    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    if (selectedLevel !== 'All') {
      filtered = filtered.filter(course => course.level === selectedLevel)
    }

    setFilteredCourses(filtered)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          <BookOpen className="w-8 h-8 text-primary-500" />
          My Courses & Catalog
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover courses tailored to your learning path with AI match scores.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card shadow-sm border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field bg-white dark:bg-gray-800"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="input-field bg-white dark:bg-gray-800"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Row */}
      {filteredCourses.filter(c => c.enrolled).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Continue Learning</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.filter(c => c.enrolled).map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Catalog */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
           <Sparkles className="w-5 h-5 text-purple-500" />
           Recommended For You
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.filter(c => !c.enrolled).map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}

function CourseCard({ course }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/student/courses/${course.id}`)}
      className="card hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col h-full overflow-hidden border border-gray-100 dark:border-gray-800 p-0"
    >
      <div className="relative overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-800 dark:text-gray-200 shadow-sm">
          {course.level}
        </div>
        
        {course.aiMatch >= 90 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-indigo-500 px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-sm flex items-center gap-1">
             <Sparkles className="w-3 h-3" />
             {course.aiMatch}% Match
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{course.instructor}</p>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatTime(course.duration)}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {course.lessons} lessons
          </div>
        </div>
        
        {course.enrolled ? (
           <div className="mt-auto space-y-2">
             <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
               <span>Progress</span>
               <span className="text-primary-600">{course.progress}%</span>
             </div>
             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
               <div
                 className="bg-primary-500 h-2 rounded-full"
                 style={{ width: `${course.progress}%` }}
               ></div>
             </div>
             <button
               onClick={(event) => {
                 event.stopPropagation()
                 navigate(`/student/courses/${course.id}`)
               }}
               className="w-full mt-3 btn-secondary py-2 flex items-center justify-center gap-2 text-sm font-bold"
             >
                <Play className="w-4 h-4" /> Continue
             </button>
           </div>
        ) : (
           <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-1">
               <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
               <span className="font-bold text-gray-900 dark:text-white">
                 {course.rating}
               </span>
               <span className="text-xs text-gray-500 dark:text-gray-400">
                 ({course.reviews.toLocaleString()})
               </span>
             </div>
             <button
               onClick={(event) => {
                 event.stopPropagation()
                 navigate(`/student/courses/${course.id}`)
               }}
               className="btn-primary text-sm px-4 py-1.5 font-bold"
             >
               Enroll
             </button>
           </div>
        )}
      </div>
    </div>
  )
}
