const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server authentication is not configured' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }
    
    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

module.exports = auth
