const express = require('express')
const Lesson = require('../models/Lesson')
const User = require('../models/User')
const Course = require('../models/Course')
const auth = require('../middleware/auth')
const notificationService = require('../services/notificationService')

const router = express.Router()

// @route   GET /api/lessons/:id
// @desc    Get single lesson
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('course')
    
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }
    
    res.json({ success: true, lesson })
  } catch (error) {
    console.error('Get lesson error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/lessons/:id/complete
// @desc    Mark lesson as completed
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
    
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }
    
    const user = await User.findById(req.user._id)
    const enrolled = user.enrolledCourses.some(
      courseId => courseId.toString() === lesson.course.toString()
    )

    if (!enrolled) {
      return res.status(403).json({ success: false, message: 'You must enroll in this course first' })
    }
    
    // Check if already completed
    const alreadyCompleted = user.completedLessons.some(
      cl => cl.lesson.toString() === lesson._id.toString()
    )
    
    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: 'Lesson already completed' })
    }
    
    // Mark lesson as completed
    await lesson.markCompleted(user._id)
    
    // Add to user's completed lessons
    user.completedLessons.push({
      lesson: lesson._id,
      completedAt: new Date()
    })
    
    // Award XP
    await user.addXP(10)
    
    // Update streak
    await user.updateStreak()
    
    await user.save()
    const course = await Course.findById(lesson.course)
    await notificationService.notifyLessonCompleted(
      user._id,
      lesson.title,
      course?.title || 'your course'
    )
    
    res.json({ success: true, message: 'Lesson marked as completed' })
  } catch (error) {
    console.error('Complete lesson error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
