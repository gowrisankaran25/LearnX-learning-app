const express = require('express')
const { body, validationResult } = require('express-validator')
const Course = require('../models/Course')
const User = require('../models/User')
const auth = require('../middleware/auth')
const notificationService = require('../services/notificationService')

const router = express.Router()

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, level, search } = req.query
    
    let query = { published: true }
    
    if (category) query.category = category
    if (level) query.level = level
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
    
    res.json({ success: true, courses })
  } catch (error) {
    console.error('Get courses error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email bio')
      .populate('lessons')
      .populate('quizzes')
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    res.json({ success: true, course })
  } catch (error) {
    console.error('Get course error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    const user = await User.findById(req.user._id)
    
    // Check if already enrolled
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' })
    }
    
    // Enroll user
    user.enrolledCourses.push(course._id)
    course.enrolledStudents.push(user._id)
    
    await user.save()
    await course.save()
    
    // Award XP for enrolling
    await user.addXP(50)
    await notificationService.notifyCourseEnrolled(user._id, course.title)
    
    res.json({ success: true, message: 'Successfully enrolled in course' })
  } catch (error) {
    console.error('Enroll error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/courses/:id/progress
// @desc    Get course progress for user
// @access  Private
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('lessons')
    const user = await User.findById(req.user._id)
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    const progress = course.getStudentProgress(user._id)
    
    res.json({ success: true, progress })
  } catch (error) {
    console.error('Get progress error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/courses/:id/review
// @desc    Add review to course
// @access  Private
router.post('/:id/review', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { rating, comment } = req.body
    const course = await Course.findById(req.params.id)
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    await course.addReview(req.user._id, rating, comment)
    
    res.json({ success: true, message: 'Review added successfully' })
  } catch (error) {
    console.error('Add review error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
