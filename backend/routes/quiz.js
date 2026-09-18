const express = require('express')
const Quiz = require('../models/Quiz')
const User = require('../models/User')
const auth = require('../middleware/auth')
const notificationService = require('../services/notificationService')

const router = express.Router()

// @route   GET /api/quizzes/history
// @desc    Get user's quiz history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('quizAttempts.quiz')

    const history = user.quizAttempts
      .filter(attempt => attempt.quiz)
      .map(attempt => ({
        quizId: attempt.quiz._id,
        quizTitle: attempt.quiz.title,
        score: attempt.score,
        completedAt: attempt.completedAt
      }))

    res.json({ success: true, history })
  } catch (error) {
    console.error('Get history error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/quizzes/:id
// @desc    Get single quiz (without answers)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course')
      .populate('lesson')
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' })
    }
    
    // Remove correct answers from response
    const quizWithoutAnswers = {
      ...quiz._doc,
      questions: quiz.questions.map(q => ({
        ...q._doc,
        correctAnswer: undefined
      }))
    }
    
    res.json({ success: true, quiz: quizWithoutAnswers })
  } catch (error) {
    console.error('Get quiz error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz answers
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body
    
    const quiz = await Quiz.findById(req.params.id)
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' })
    }
    
    const user = await User.findById(req.user._id)
    const enrolled = user.enrolledCourses.some(
      courseId => courseId.toString() === quiz.course.toString()
    )

    if (!enrolled) {
      return res.status(403).json({ success: false, message: 'You must enroll in this course first' })
    }
    
    // Submit quiz attempt
    await quiz.submitAttempt(user._id, answers, timeTaken)
    
    // Calculate score
    const score = quiz.calculateScore(answers)
    
    // Update user's quiz attempts
    user.quizAttempts.push({
      quiz: quiz._id,
      score,
      answers,
      completedAt: new Date()
    })
    
    // Update learning DNA
    await user.updateLearningDNA({
      topic: quiz.topic,
      score
    })
    
    // Award XP based on score
    const xpEarned = Math.floor(score / 10)
    await user.addXP(xpEarned)
    
    // Update streak
    await user.updateStreak()
    
    await user.save()
    await notificationService.notifyQuizCompleted(user._id, quiz.title, score)
    const results = quiz.questions.map((question) => {
      const questionId = question._id.toString()
      const yourAnswer = answers?.[questionId]
      return {
        questionId,
        correct: Number(yourAnswer) === Number(question.correctAnswer),
        yourAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      }
    })
    
    res.json({
      success: true,
      score,
      passed: score >= quiz.passingScore,
      correct: results.filter(result => result.correct).length,
      total: results.length,
      results,
      xpEarned,
      message: score >= quiz.passingScore ? 'Quiz passed!' : 'Quiz not passed. Keep practicing!'
    })
  } catch (error) {
    console.error('Submit quiz error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
