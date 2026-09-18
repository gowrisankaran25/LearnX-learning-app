const express = require('express')
const User = require('../models/User')
const Course = require('../models/Course')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/leaderboard/global
// @desc    Get global leaderboard
// @access  Public
router.get('/global', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    
    const leaderboard = await User.find({ role: 'student' })
      .select('name gamification.xp gamification.streak gamification.level')
      .sort({ 'gamification.xp': -1 })
      .limit(parseInt(limit))
    
    // Add rank
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      ...user._doc
    }))
    
    res.json({ success: true, leaderboard: rankedLeaderboard })
  } catch (error) {
    console.error('Get global leaderboard error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/leaderboard/course/:courseId
// @desc    Get course-specific leaderboard
// @access  Public
router.get('/course/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('enrolledStudents')
      .populate('lessons')
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    // Calculate progress for each enrolled student
    const studentProgress = await Promise.all(
      course.enrolledStudents.map(async (student) => {
        const user = await User.findById(student._id)
        const progress = course.getStudentProgress(user._id)
        
        return {
          userId: user._id,
          name: user.name,
          progress: progress.percentage,
          completedLessons: progress.completedLessons
        }
      })
    )
    
    // Sort by progress
    studentProgress.sort((a, b) => b.progress - a.progress)
    
    // Add rank
    const rankedLeaderboard = studentProgress.map((student, index) => ({
      rank: index + 1,
      ...student
    }))
    
    res.json({ success: true, leaderboard: rankedLeaderboard })
  } catch (error) {
    console.error('Get course leaderboard error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
