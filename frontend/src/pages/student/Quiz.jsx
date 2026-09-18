import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { quizAPI } from '../../lib/api'

export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuiz()
  }, [id])

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit()
    }
  }, [timeLeft, submitted])

  const loadQuiz = async () => {
    try {
      const res = await quizAPI.getById(id);
      const q = res.data?.quiz;
      if (!q) return;

      const formattedQuiz = {
        id: q._id,
        title: q.title,
        courseTitle: q.course?.title || 'Course Quiz',
        duration: q.duration || 600,
        questions: q.questions.map((question) => ({
          id: question._id,
          type: question.type,
          question: question.question,
          options: question.options || [],
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || '',
          aiHint: question.aiHint
        }))
      }
      setQuiz(formattedQuiz)
      setTimeLeft(formattedQuiz.duration)
    } catch (error) {
      console.error('Error loading quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = async () => {
    try {
      setSubmitted(true)
      const response = await quizAPI.submit(id, answers)
      setTimeout(() => {
        navigate(`/student/quiz/${id}/result`, { state: { answers, quiz, result: response.data } })
      }, 1500)
    } catch (error) {
      console.error('Error submitting quiz:', error)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((currentQuestion + 1) / quiz?.questions.length) * 100
  const answeredCount = Object.keys(answers).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!quiz) {
    return <div>Quiz not found</div>
  }

  const question = quiz.questions[currentQuestion]

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Quiz Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{quiz.courseTitle}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {answeredCount} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge bg-primary-100 text-primary-700">
              {question.type === 'mcq' ? 'Multiple Choice' : 'True / False'}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {question.question}
          </h2>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = answers[question.id] === index
            return (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, index)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">{option}</span>
                </div>
              </button>
            )
          })}
        </div>
        
        {/* AI Hint Section */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
           <button 
             onClick={() => alert(question.aiHint || "AI: Look closely at the syntax requirements for Java!")}
             className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium text-sm flex items-center gap-2 transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1.5 rounded-md"
           >
             <Sparkles className="w-4 h-4" /> Ask AI Tutor for a Hint
           </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <AlertCircle className="w-4 h-4" />
          <span>Answered: {answeredCount} / {quiz.questions.length}</span>
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={answeredCount === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            className="btn-primary"
          >
            Next
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Question Navigator</h3>
        <div className="grid grid-cols-5 gap-2">
          {quiz.questions.map((q, index) => {
            const isAnswered = answers[q.id] !== undefined
            const isCurrent = index === currentQuestion
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  isCurrent
                    ? 'bg-primary-500 text-white'
                    : isAnswered
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
