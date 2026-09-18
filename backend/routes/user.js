const express = require('express')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const Course = require('../models/Course')
const Badge = require('../models/Badge')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('enrolledCourses')
      .populate('gamification.badges')
    
    res.json({ success: true, user })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().notEmpty(),
  body('bio').optional().isLength({ max: 500 }),
  body('learningGoals').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { name, bio, learningGoals, preferences } = req.body
    
    const user = await User.findById(req.user._id)
    
    if (name) user.name = name
    if (bio !== undefined) user.bio = bio
    if (learningGoals) user.learningGoals = learningGoals
    if (preferences) user.preferences = { ...user.preferences, ...preferences }
    
    await user.save()
    
    res.json({ success: true, user })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/users/learning-dna
// @desc    Get user's learning DNA
// @access  Private
router.get('/learning-dna', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('learningDNA')
    res.json({ success: true, learningDNA: user.learningDNA })
  } catch (error) {
    console.error('Get learning DNA error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/users/progress
// @desc    Get user's overall progress
// @access  Private
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses')
      .populate('completedLessons.lesson')
    
    const totalCourses = user.enrolledCourses.length
    const completedLessons = user.completedLessons.length
    const totalQuizzes = user.quizAttempts.length
    const avgQuizScore = user.learningDNA.averageQuizScore
    
    res.json({
      success: true,
      progress: {
        totalCourses,
        completedLessons,
        totalQuizzes,
        avgQuizScore,
        xp: user.gamification.xp,
        level: user.gamification.level,
        streak: user.gamification.streak
      }
    })
  } catch (error) {
    console.error('Get progress error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/users/weaknesses
// @desc    Get user's weak areas
// @access  Private
router.get('/weaknesses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('learningDNA.weakAreas')
    res.json({ success: true, weakAreas: user.learningDNA.weakAreas })
  } catch (error) {
    console.error('Get weaknesses error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/users/recommendations
// @desc    Get personalized recommendations
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses')
    
    // Simple recommendation algorithm
    const recommendations = []
    
    // Recommend based on weak areas
    user.learningDNA.weakAreas.forEach(area => {
      if (area.priority === 'high') {
        recommendations.push({
          type: 'improvement',
          topic: area.topic,
          reason: 'Low performance detected',
          priority: 'high'
        })
      }
    })
    
    // Recommend based on enrolled courses
    user.enrolledCourses.forEach(course => {
      recommendations.push({
        type: 'continue',
        courseId: course._id,
        title: course.title,
        reason: 'Continue learning'
      })
    })
    
    res.json({ success: true, recommendations })
  } catch (error) {
    console.error('Get recommendations error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/users/achievements
// @desc    Get user achievements and badges
// @access  Private
router.get('/achievements', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('gamification.badges')
    
    const allBadges = await Badge.find()
    const earnedBadgeIds = (user.gamification.badges || []).map(b => b._id.toString())
    
    const badges = allBadges.map(badge => ({
      id: badge._id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      rarity: badge.rarity,
      xpReward: badge.xpReward,
      requirements: badge.requirements,
      unlocked: earnedBadgeIds.includes(badge._id.toString())
    }))

    res.json({
      success: true,
      gamification: user.gamification,
      badges
    })
  } catch (error) {
    console.error('Get achievements error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
