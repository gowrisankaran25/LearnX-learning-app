const express = require('express')
const User = require('../models/User')
const recommendationService = require('../services/recommendationService')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/recommendations/learning-path
// @desc    Get personalized learning path
// @access  Private
router.get('/learning-path', auth, async (req, res) => {
  try {
    const learningPath = await recommendationService.generateLearningPath(req.user._id)
    res.json({ success: true, learningPath })
  } catch (error) {
    console.error('Get learning path error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/recommendations/daily-goals
// @desc    Get daily learning goals
// @access  Private
router.get('/daily-goals', auth, async (req, res) => {
  try {
    const dailyGoals = await recommendationService.getDailyGoals(req.user._id)
    res.json({ success: true, dailyGoals })
  } catch (error) {
    console.error('Get daily goals error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/recommendations/courses
// @desc    Get personalized course recommendations
// @access  Private
router.get('/courses', auth, async (req, res) => {
  try {
    const { limit = 5 } = req.query
    const courses = await recommendationService.getCourseRecommendations(req.user._id, parseInt(limit))
    res.json({ success: true, courses })
  } catch (error) {
    console.error('Get course recommendations error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/recommendations/patterns
// @desc    Get learning pattern analysis
// @access  Private
router.get('/patterns', auth, async (req, res) => {
  try {
    const patterns = await recommendationService.analyzeLearningPatterns(req.user._id)
    res.json({ success: true, patterns })
  } catch (error) {
    console.error('Get patterns error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/recommendations/update-dna
// @desc    Update learning DNA based on activity
// @access  Private
router.post('/update-dna', auth, async (req, res) => {
  try {
    const { type, ...activityData } = req.body
    const learningDNA = await recommendationService.updateLearningDNA(req.user._id, {
      type,
      ...activityData
    })
    res.json({ success: true, learningDNA })
  } catch (error) {
    console.error('Update learning DNA error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
