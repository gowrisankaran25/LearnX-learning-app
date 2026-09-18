import { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Lock,
  BrainCircuit,
  Map,
  ArrowRight,
  TrendingDown
} from 'lucide-react'
import { recommendationAPI } from '../../lib/api'

export default function LearningPath() {
  const [loading, setLoading] = useState(true)
  const [learningPath, setLearningPath] = useState(null)

  useEffect(() => {
    loadLearningPath()
  }, [])

  const loadLearningPath = async () => {
    try {
      const response = await recommendationAPI.getLearningPath()
      const recommendations = response.data?.learningPath || []
      const nodes = recommendations.flatMap((recommendation, recommendationIndex) => {
        const items = recommendation.lessons || (recommendation.lesson ? [recommendation.lesson] : [])
        return items.map((lesson, index) => ({
          id: lesson._id || `${recommendationIndex}-${index}`,
          title: lesson.title || recommendation.courseTitle || recommendation.topic,
          type: 'lesson',
          status: index === 0 && recommendationIndex === 0 ? 'current' : 'locked',
          reason: recommendation.reason,
          courseId: lesson.courseId || recommendation.courseId,
        }))
      })
      setLearningPath({
        courseName: recommendations[0]?.courseTitle || recommendations[0]?.topic || 'Your personalized path',
        progress: 0,
        nodes,
      })
    } catch (error) {
      console.error('Error loading learning path:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !learningPath) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          <Map className="w-8 h-8 text-primary-500" />
          AI Learning Path
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your path dynamically adapts based on your performance and goals.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* The Roadmap */}
        <div className="md:col-span-2 card">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {learningPath.courseName}
            </h2>
            <span className="text-primary-600 font-bold">{learningPath.progress}% Complete</span>
          </div>

          <div className="relative ml-4">
            {/* Vertical connecting line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

            <div className="space-y-6 relative z-10">
              {learningPath.nodes.map((node, index) => {
                const isCompleted = node.status === 'completed'
                const isCurrent = node.status === 'current'
                const isLocked = node.status === 'locked'
                const isFailed = node.status === 'failed'
                const isRemedial = node.type === 'remedial'

                return (
                  <div key={node.id} className="flex items-start gap-6 group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                      isCompleted ? 'bg-green-500 text-white' : 
                      isFailed ? 'bg-red-500 text-white' :
                      isCurrent ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 
                      'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : 
                       isFailed ? <TrendingDown className="w-4 h-4" /> :
                       isCurrent ? <Play className="w-4 h-4 ml-0.5" /> : 
                       <Lock className="w-4 h-4" />}
                    </div>

                    <div className={`flex-1 p-4 rounded-xl border ${
                      isCurrent ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm' :
                      isFailed ? 'border-red-200 bg-red-50 dark:bg-red-900/10' :
                      isRemedial ? 'border-purple-200 bg-purple-50 dark:bg-purple-900/10' :
                      'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800'
                    } ${isLocked ? 'opacity-60' : ''}`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`font-bold ${
                          isCurrent ? 'text-primary-700 dark:text-primary-300' :
                          isFailed ? 'text-red-700 dark:text-red-300' :
                          isRemedial ? 'text-purple-700 dark:text-purple-300' :
                          'text-gray-900 dark:text-white'
                        }`}>
                          {node.title}
                        </h3>
                        {isFailed && <span className="text-sm font-bold text-red-600">Score: {node.score}%</span>}
                      </div>
                      
                      {isRemedial && (
                        <div className="mt-2 flex items-start gap-2 text-sm text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                          <BrainCircuit className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{node.reason}</span>
                        </div>
                      )}
                      
                      {isCurrent && (
                        <button className="mt-4 btn-primary py-2 px-4 text-sm flex items-center gap-2">
                          Start Lesson <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Dynamic AI Routing Info */}
        <div className="space-y-6">
          <div className="card mist-contrast-panel bg-gradient-to-br from-indigo-900 to-purple-900 text-white border-0 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 text-white/10">
               <BrainCircuit className="w-32 h-32" />
             </div>
             <div className="relative z-10">
               <h3 className="text-xl font-bold mb-4">How AI Adapts Your Path</h3>
               
               <div className="space-y-4 relative">
                  <div className="flex gap-3 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">1</div>
                    <p className="text-sm text-indigo-100">You scored 45% in Arrays Quiz</p>
                  </div>
                  <div className="w-0.5 h-6 bg-white/20 absolute left-3 top-5"></div>
                  
                  <div className="flex gap-3 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">2</div>
                    <p className="text-sm text-indigo-100">AI detects weakness in indexing concepts</p>
                  </div>
                  <div className="w-0.5 h-6 bg-white/20 absolute left-3 top-16"></div>
                  
                  <div className="flex gap-3 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/50">3</div>
                    <p className="text-sm font-bold text-white">Remedial lesson dynamically injected!</p>
                  </div>
               </div>
               
               <p className="mt-6 text-xs text-indigo-200 border-t border-white/20 pt-4">
                 Your path is completely unique to your learning speed and style. No two students see the same roadmap.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
