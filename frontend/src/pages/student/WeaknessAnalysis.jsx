import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Sparkles,
  BookOpen, 
  Target,
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react'
import { calculateProgress } from '../../lib/utils'
import { userAPI } from '../../lib/api'

export default function WeaknessAnalysis() {
  const [loading, setLoading] = useState(true)
  const [weaknessData, setWeaknessData] = useState({
    topics: [],
    aiInsight: null
  })

  useEffect(() => {
    loadWeaknessData()
  }, [])

  const loadWeaknessData = async () => {
    try {
      const res = await userAPI.getWeaknesses();
      const weaknesses = res.data?.weakAreas || [];
      
      const topics = weaknesses.map(w => {
        let color = 'bg-green-500';
        let icon = '🟢';
        if (w.priority === 'high' || w.score < 50) {
          color = 'bg-red-500'; icon = '🔴';
        } else if (w.priority === 'medium' || w.score < 70) {
          color = 'bg-yellow-400'; icon = '🟡';
        }
        return {
          name: w.topic,
          score: w.score,
          color,
          icon
        }
      });

      const weakest = topics.length > 0 ? topics.reduce((min, t) => t.score < min.score ? t : min, topics[0]) : null;

      const formattedData = {
        topics,
        aiInsight: {
          text: weakest 
            ? `${weakest.name} is currently your weakest subject. I recommend spending 20 minutes reviewing this topic today.` 
            : 'You are doing great! Keep up the good work and maintain your current study habits.',
          lesson: weakest ? `${weakest.name} Basics` : 'Review Session',
          duration: 20
        }
      }
      setWeaknessData(formattedData)
    } catch (error) {
      console.error('Error loading weakness data:', error)
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          <BrainCircuit className="w-8 h-8 text-primary-500" />
          Weakness Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Identify your weak areas and get personalized AI recommendations to improve.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Visual Progress Bars */}
        <div className="card shadow-sm border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Your Learning Weaknesses
          </h2>
          <div className="space-y-8">
            {weaknessData.topics.map((topic, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{topic.name}</span>
                  <span className="font-bold flex items-center gap-2 text-lg">
                    {topic.icon} {topic.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 shadow-inner">
                  <div
                    className={`${topic.color} h-4 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                    style={{ width: `${topic.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800/30 shadow-md">
            <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Insight
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed mb-6">
                "{weaknessData.aiInsight.text}"
              </p>
              <button className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base shadow-sm hover:shadow-md transition-shadow">
                Start Recommended Lesson <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="card mist-contrast-panel bg-primary-600 text-white shadow-sm border-0">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Improvement Opportunity</h3>
                  <p className="text-primary-100 mt-1">Completing this lesson can boost your overall score by 5%.</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
