const express = require('express')
const { body, validationResult } = require('express-validator')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Quiz = require('../models/Quiz')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// Auth middleware with teacher role check
const teacherAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }
    
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.userId)
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }
    
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Teacher access required' })
    }
    
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

// @route   POST /api/teacher/courses
// @desc    Create a new course
// @access  Teacher
router.post('/courses', teacherAuth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['Programming', 'Database', 'Networking', 'AI/ML', 'Web Development', 'Other']),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('duration').isNumeric().withMessage('Duration must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const courseData = {
      ...req.body,
      instructor: req.user._id
    }
    
    const course = await Course.create(courseData)
    
    res.status(201).json({ success: true, course })
  } catch (error) {
    console.error('Create course error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   PUT /api/teacher/courses/:id
// @desc    Update a course
// @access  Teacher
router.put('/courses/:id', teacherAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' })
    }
    
    Object.assign(course, req.body)
    await course.save()
    
    res.json({ success: true, course })
  } catch (error) {
    console.error('Update course error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   DELETE /api/teacher/courses/:id
// @desc    Delete a course
// @access  Teacher
router.delete('/courses/:id', teacherAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' })
    }
    
    await course.deleteOne()
    
    res.json({ success: true, message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Delete course error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/teacher/courses/:courseId/lessons
// @desc    Create a lesson
// @access  Teacher
router.post('/courses/:courseId/lessons', teacherAuth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('videoUrl').trim().notEmpty().withMessage('Video URL is required'),
  body('videoDuration').isNumeric().withMessage('Video duration must be a number'),
  body('order').isNumeric().withMessage('Order must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const lessonData = {
      ...req.body,
      course: req.params.courseId
    }
    const course = await Course.findById(req.params.courseId)
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this course' })
    }
    
    const lesson = await Lesson.create(lessonData)
    
    // Add lesson to course
    course.lessons.push(lesson._id)
    await course.save()
    
    res.status(201).json({ success: true, lesson })
  } catch (error) {
    console.error('Create lesson error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/teacher/courses/:courseId/quizzes
// @desc    Create a quiz
// @access  Teacher
router.post('/courses/:courseId/quizzes', teacherAuth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('questions').isArray().withMessage('Questions must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const quizData = {
      ...req.body,
      course: req.params.courseId
    }
    const course = await Course.findById(req.params.courseId)
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this course' })
    }
    
    const quiz = await Quiz.create(quizData)
    
    // Add quiz to course
    course.quizzes.push(quiz._id)
    await course.save()
    
    res.status(201).json({ success: true, quiz })
  } catch (error) {
    console.error('Create quiz error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/teacher/students
// @desc    Get all students
// @access  Teacher
router.get('/students', teacherAuth, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email learningDNA gamification')
      .sort({ 'gamification.xp': -1 })
    
    res.json({ success: true, students })
  } catch (error) {
    console.error('Get students error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/teacher/students/:studentId/progress
// @desc    Get student progress
// @access  Teacher
router.get('/students/:studentId/progress', teacherAuth, async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId)
      .populate('enrolledCourses')
      .populate('completedLessons.lesson')
      .populate('quizAttempts.quiz')
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }
    
    const progress = {
      enrolledCourses: student.enrolledCourses.length,
      completedLessons: student.completedLessons.length,
      quizAttempts: student.quizAttempts.length,
      averageScore: student.learningDNA.averageQuizScore,
      learningDNA: student.learningDNA,
      gamification: student.gamification
    }
    
    res.json({ success: true, progress })
  } catch (error) {
    console.error('Get student progress error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
