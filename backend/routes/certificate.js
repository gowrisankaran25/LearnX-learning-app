const express = require('express')
const certificateService = require('../services/certificateService')
const User = require('../models/User')
const Course = require('../models/Course')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/certificate/:courseId
// @desc    Generate certificate for completed course
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
  try {
    const certificate = await certificateService.generateCertificate(
      req.user._id,
      req.params.courseId
    )
    
    const html = certificateService.getCertificateHTML(certificate)
    
    res.setHeader('Content-Type', 'text/html')
    res.send(html)
  } catch (error) {
    console.error('Generate certificate error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
})

// @route   GET /api/certificate/verify/:certificateId
// @desc    Verify certificate
// @access  Public
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const verification = await certificateService.verifyCertificate(req.params.certificateId)
    res.json({ success: true, verification })
  } catch (error) {
    console.error('Verify certificate error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/certificate/user
// @desc    Get all certificates for user
// @access  Private
router.get('/user/certificates', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('enrolledCourses')
    
    const certificates = []
    
    for (const course of user.enrolledCourses) {
      const courseData = await Course.findById(course._id)
      const progress = courseData.getStudentProgress(req.user._id)
      
      if (progress.percentage >= 100) {
        const certificate = await certificateService.generateCertificate(
          req.user._id,
          course._id
        )
        certificates.push({
          courseId: course._id,
          courseName: course.title,
          certificateId: certificate.id,
          verificationCode: certificate.verificationCode,
          completionDate: certificate.completionDate,
          score: progress.percentage
        })
      }
    }
    
    res.json({ success: true, certificates })
  } catch (error) {
    console.error('Get certificates error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
