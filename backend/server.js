require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { createServer } = require('http')
const { Server } = require('socket.io')

// Register all Mongoose models
require('./models/Badge')
require('./models/User')
require('./models/Course')
require('./models/Lesson')
require('./models/Quiz')
require('./models/Forum')
require('./models/ForumPost')

// Import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const courseRoutes = require('./routes/course')
const lessonRoutes = require('./routes/lesson')
const quizRoutes = require('./routes/quiz')
const aiRoutes = require('./routes/ai')
const teacherRoutes = require('./routes/teacher')
const adminRoutes = require('./routes/admin')
const leaderboardRoutes = require('./routes/leaderboard')
const recommendationRoutes = require('./routes/recommendations')
const forumRoutes = require('./routes/forum')
const certificateRoutes = require('./routes/certificate')
const notificationService = require('./services/notificationService')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Initialize notification service
notificationService.initialize(io)

// Security middleware
app.use(helmet())
app.use(cors())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100 // allow active local development without weakening production limits
})
app.use('/api/', limiter)

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files for uploads
app.use('/uploads', express.static('uploads'))

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnx')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/forum', forumRoutes)
app.use('/api/certificate', certificateRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LearnX API is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔌 WebSocket server ready`)
})
