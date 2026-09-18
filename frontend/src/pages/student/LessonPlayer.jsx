import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2,
  Maximize,
  CheckCircle,
  BookOpen,
  MessageSquare
} from 'lucide-react'
import { lessonAPI } from '../../lib/api'

export default function LessonPlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showNotes, setShowNotes] = useState(false)

  useEffect(() => {
    loadLesson()
  }, [id])

  const loadLesson = async () => {
    try {
      const res = await lessonAPI.getById(id);
      const l = res.data?.lesson;
      if (!l) return;

      const formattedLesson = {
        id: l._id,
        title: l.title,
        courseTitle: l.course?.title || 'Course',
        courseId: l.course?._id,
        instructor: 'Instructor',
        duration: l.videoDuration || 0,
        videoUrl: l.videoUrl,
        description: l.description,
        transcript: l.transcript || 'No transcript available.',
        notes: l.notes || 'No notes available.',
        resources: l.resources || [],
        nextLesson: null, // Would require course context
        previousLesson: null,
      }
      setLesson(formattedLesson)
      setDuration(formattedLesson.duration)
    } catch (error) {
      console.error('Error loading lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    try {
      await lessonAPI.complete(id)
      navigate(`/student/courses/${lesson.courseId}`)
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!lesson) {
    return <div>Lesson not found</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Video Player */}
      <div className="card overflow-hidden p-0">
        <div className="relative bg-black aspect-video">
          {lesson.videoUrl && isYouTubeUrl(lesson.videoUrl) ? (
            <div className="w-full h-full flex flex-col">
              <iframe
                className="w-full flex-1 min-h-0"
                src={toYouTubeEmbedUrl(lesson.videoUrl)}
                title={lesson.title}
                loading="eager"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="flex items-center justify-between gap-3 bg-gray-950 px-4 py-2 text-sm text-white">
                <span>Video hosted on YouTube</span>
                <a
                  href={toYouTubeWatchUrl(lesson.videoUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-cyan-300 hover:text-white"
                >
                  Open on YouTube ↗
                </a>
              </div>
            </div>
          ) : lesson.videoUrl ? (
            <video
              className="w-full h-full object-contain"
              src={lesson.videoUrl}
              controls
              playsInline
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-center text-white p-6">
              <div>
                <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <p className="text-lg">This lesson does not have a video yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {lesson.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{lesson.courseTitle}</p>
              </div>
              <button
                onClick={handleComplete}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Mark Complete
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{lesson.description}</p>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                onClick={() => setShowNotes(false)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  !showNotes
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Transcript
              </button>
              <button
                onClick={() => setShowNotes(true)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  showNotes
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Notes
              </button>
            </div>

            {showNotes ? (
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  {lesson.notes}
                </pre>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {lesson.transcript}
              </p>
            )}
          </div>

          {/* Resources */}
          {lesson.resources.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Resources
              </h3>
              <div className="space-y-2">
                {lesson.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{resource.title}</span>
                    <span className="text-xs text-primary-600 font-medium uppercase">
                      {resource.type}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Tutor Quick Access */}
          <div className="card mist-contrast-panel bg-gradient-to-br from-primary-500 to-accent-500 text-white">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              AI Tutor
            </h3>
            <p className="text-sm opacity-90 mb-4">
              Stuck on something? Ask our AI tutor for help with this lesson.
            </p>
            <button
              onClick={() => navigate('/student/ai-tutor')}
              className="w-full bg-white text-primary-600 font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ask a Question
            </button>
          </div>

          {/* Navigation */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Lesson Navigation
            </h3>
            <div className="space-y-3">
              {lesson.previousLesson && (
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left">
                  <SkipBack className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Previous</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {lesson.previousLesson.title}
                    </p>
                  </div>
                </button>
              )}
              {lesson.nextLesson && (
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Next</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {lesson.nextLesson.title}
                    </p>
                  </div>
                  <SkipForward className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/i.test(url)
}

function toYouTubeEmbedUrl(url) {
  if (url.includes('/embed/')) return url

  try {
    const parsedUrl = new URL(url)
    const videoId = parsedUrl.searchParams.get('v') || parsedUrl.pathname.split('/').filter(Boolean).pop()
    return `https://www.youtube.com/embed/${videoId}?rel=0`
  } catch {
    return url
  }
}

function toYouTubeWatchUrl(url) {
  if (url.includes('/embed/')) {
    const videoId = url.split('/embed/')[1].split(/[?&#]/)[0]
    return `https://www.youtube.com/watch?v=${videoId}`
  }
  return url
}
