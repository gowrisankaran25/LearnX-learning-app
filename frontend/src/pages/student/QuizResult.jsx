import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Award,
  ArrowRight,
  RotateCcw,
  Share2,
  Sparkles,
  BrainCircuit,
  Target
} from 'lucide-react'

export default function QuizResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { answers, quiz, result } = location.state || {}

  if (!quiz || !answers) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No quiz results found</p>
        <button
          onClick={() => navigate('/student/courses')}
          className="btn-primary mt-4"
        >
          Back to Courses
        </button>
      </div>
    )
  }

  const calculateScore = () => {
    if (result?.results) {
      return {
        correct: result.correct,
        total: result.total,
        percentage: result.score,
        results: result.results,
      }
    }

    let correct = 0
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return {
      correct,
      total: quiz.questions.length,
      percentage: Math.round((correct / quiz.questions.length) * 100),
      results: quiz.questions.map((question) => ({
        questionId: question.id,
        correct: answers[question.id] === question.correctAnswer,
        yourAnswer: answers[question.id],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      })),
    }
  }

  const score = calculateScore()
  const passed = score.percentage >= 60

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Result Header */}
      <div className={`card text-center relative overflow-hidden ${
        passed ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800' : 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-100 dark:border-orange-800'
      }`}>
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg ${
          passed ? 'bg-green-500' : 'bg-orange-500'
        }`}>
          {passed ? (
            <Award className="w-10 h-10 text-white" />
          ) : (
            <TrendingUp className="w-10 h-10 text-white" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {passed ? 'Outstanding Work!' : 'Keep Learning!'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">
          {passed
            ? 'You mastered this topic successfully.'
            : 'You need to review the material and try again.'}
        </p>

        <div className="flex items-center justify-center gap-12 mb-8 bg-white/50 dark:bg-gray-800/50 py-6 rounded-2xl mx-12 shadow-sm">
          <div className="text-center">
            <p className="text-5xl font-extrabold text-gray-900 dark:text-white mb-1">{score.percentage}%</p>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Score</p>
          </div>
          <div className="w-px h-16 bg-gray-300 dark:bg-gray-600"></div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600 mb-1">{score.correct}</p>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Correct</p>
          </div>
          <div className="w-px h-16 bg-gray-300 dark:bg-gray-600"></div>
          <div className="text-center">
            <p className="text-4xl font-bold text-red-600 mb-1">{score.total - score.correct}</p>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Incorrect</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 relative z-10">
          <button
            onClick={() => navigate(`/student/quiz/${id}`)}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
          <button
            onClick={() => navigate('/student/learning-path')}
            className="btn-primary flex items-center gap-2"
          >
            Continue Learning Path
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Post-Quiz Analysis */}
      <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-100 dark:border-purple-800/30">
        <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-6 flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          AI Performance Analysis
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-purple-100/50 dark:border-purple-900/50">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-500" />
              What You Did Well
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                 <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                 <span>You have a flawless understanding of array syntax and variable declarations.</span>
              </li>
              <li className="flex items-start gap-2">
                 <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                 <span>You successfully identified the zero-based indexing mechanism in Java.</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-purple-100/50 dark:border-purple-900/50">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-orange-500" />
              AI Focus Areas
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                 <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                 <span><strong className="font-semibold">Array Length Property:</strong> You confused the length property with a method call.</span>
              </li>
              <li className="flex items-start gap-2">
                 <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                 <span><strong className="font-semibold">Action Plan:</strong> I've automatically added a 5-minute remedial lesson on "Java Array Properties vs Methods" to your Learning Path.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Detailed Question Breakdown
        </h2>
        <div className="space-y-4">
          {quiz.questions.map((question, index) => {
            const questionResult = score.results.find(resultItem => resultItem.questionId === question.id)
            const isCorrect = questionResult?.correct
            return (
              <div
                key={question.id}
                className={`p-5 rounded-xl border-2 transition-all ${
                  isCorrect
                    ? 'border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10'
                    : 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <XCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
                      {index + 1}. {question.question}
                    </p>
                    <div className="space-y-4 text-sm">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                          <p className="text-gray-500 dark:text-gray-400 mb-1 text-xs uppercase font-bold tracking-wider">Your Answer</p>
                          <p className={`font-medium ${
                            isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                          }`}>
                            {question.options[questionResult?.yourAnswer] || "Not answered"}
                          </p>
                        </div>
                        {!isCorrect && (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-gray-500 dark:text-gray-400 mb-1 text-xs uppercase font-bold tracking-wider">Correct Answer</p>
                            <p className="font-medium text-green-700 dark:text-green-400">
                              {question.options[questionResult?.correctAnswer]}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700 flex gap-3">
                         <Sparkles className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                         <p className="text-gray-700 dark:text-gray-300">
                           <span className="font-bold text-gray-900 dark:text-white">AI Tutor Explanation:</span> {question.explanation}
                         </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
