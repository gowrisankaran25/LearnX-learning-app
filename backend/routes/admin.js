const express = require('express')
const User = require('../models/User')
const Course = require('../models/Course')
const auth = require('../middleware/auth')

const router = express.Router()

// Auth middleware with admin role check
const adminAuth = async (req, res, next) => {
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
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' })
    }
    
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { role, search } = req.query
    
    let query = {}
    if (role) query.role = role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
    
    res.json({ success: true, users })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body
    
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }
    
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    user.role = role
    await user.save()
    
    res.json({ success: true, user })
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    await user.deleteOne()
    
    res.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/admin/courses
// @desc    Get all courses (including unpublished)
// @access  Admin
router.get('/courses', adminAuth, async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
    
    res.json({ success: true, courses })
  } catch (error) {
    console.error('Get courses error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   PUT /api/admin/courses/:id/publish
// @desc    Publish/unpublish course
// @access  Admin
router.put('/courses/:id/publish', adminAuth, async (req, res) => {
  try {
    const { published } = req.body
    
    const course = await Course.findById(req.params.id)
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    course.published = published
    await course.save()
    
    res.json({ success: true, course })
  } catch (error) {
    console.error('Publish course error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Admin
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalCourses = await Course.countDocuments()
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalTeachers = await User.countDocuments({ role: 'teacher' })
    
    const activeUsers = await User.countDocuments({
      'gamification.lastActiveDate': {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    })
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalStudents,
        totalTeachers,
        activeUsers
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
