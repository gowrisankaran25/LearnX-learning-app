const User = require('../models/User')

class NotificationService {
  constructor() {
    this.io = null
  }

  initialize(io) {
    this.io = io
    
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)
      
      // Join user's personal room
      socket.on('join-user', (userId) => {
        socket.join(`user-${userId}`)
        console.log(`User ${userId} joined their room`)
      })
      
      // Leave user's personal room
      socket.on('leave-user', (userId) => {
        socket.leave(`user-${userId}`)
        console.log(`User ${userId} left their room`)
      })
      
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })
  }

  /**
   * Send notification to a specific user
   */
  async sendToUser(userId, notification) {
    if (!this.io) return
    
    this.io.to(`user-${userId}`).emit('notification', {
      id: Date.now(),
      ...notification,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send notification to all users
   */
  async sendToAll(notification) {
    if (!this.io) return
    
    this.io.emit('notification', {
      id: Date.now(),
      ...notification,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send notification to users with a specific role
   */
  async sendToRole(role, notification) {
    if (!this.io) return
    
    const users = await User.find({ role })
    users.forEach(user => {
      this.sendToUser(user._id, notification)
    })
  }

  /**
   * Send notification to students enrolled in a course
   */
  async sendToCourse(courseId, notification) {
    if (!this.io) return
    
    const Course = require('../models/Course')
    const course = await Course.findById(courseId).populate('enrolledStudents')
    
    if (course) {
      course.enrolledStudents.forEach(student => {
        this.sendToUser(student._id, notification)
      })
    }
  }

  /**
   * Notify user of quiz completion
   */
  async notifyQuizCompleted(userId, quizTitle, score) {
    await this.sendToUser(userId, {
      type: 'quiz_completed',
      title: 'Quiz Completed!',
      message: `You scored ${score}% on ${quizTitle}`,
      icon: 'trophy',
      action: '/analytics'
    })
  }

  /**
   * Notify user of lesson completion
   */
  async notifyLessonCompleted(userId, lessonTitle, courseTitle) {
    await this.sendToUser(userId, {
      type: 'lesson_completed',
      title: 'Lesson Completed!',
      message: `You finished "${lessonTitle}" in ${courseTitle}`,
      icon: 'check-circle',
      action: '/courses'
    })
  }

  /**
   * Notify user of achievement/badge earned
   */
  async notifyBadgeEarned(userId, badgeName) {
    await this.sendToUser(userId, {
      type: 'badge_earned',
      title: 'Achievement Unlocked!',
      message: `You earned the "${badgeName}" badge`,
      icon: 'award',
      action: '/profile'
    })
  }

  /**
   * Notify user of streak milestone
   */
  async notifyStreakMilestone(userId, streakDays) {
    await this.sendToUser(userId, {
      type: 'streak_milestone',
      title: 'Streak Milestone!',
      message: `${streakDays} day streak! Keep it up!`,
      icon: 'flame',
      action: '/dashboard'
    })
  }

  /**
   * Notify user of course enrollment
   */
  async notifyCourseEnrolled(userId, courseTitle) {
    await this.sendToUser(userId, {
      type: 'course_enrolled',
      title: 'Course Enrolled!',
      message: `You're now enrolled in ${courseTitle}`,
      icon: 'book-open',
      action: '/courses'
    })
  }

  /**
   * Notify teacher of new student enrollment
   */
  async notifyTeacherNewStudent(teacherId, studentName, courseTitle) {
    await this.sendToUser(teacherId, {
      type: 'new_student',
      title: 'New Student Enrolled',
      message: `${studentName} enrolled in ${courseTitle}`,
      icon: 'user-plus',
      action: '/teacher'
    })
  }

  /**
   * Send daily reminder
   */
  async sendDailyReminder(userId) {
    await this.sendToUser(userId, {
      type: 'daily_reminder',
      title: 'Time to Learn!',
      message: 'Complete your daily learning goals to maintain your streak',
      icon: 'bell',
      action: '/dashboard'
    })
  }

  /**
   * Notify user of weak area identified
   */
  async notifyWeakArea(userId, topic) {
    await this.sendToUser(userId, {
      type: 'weak_area',
      title: 'Focus Area Identified',
      message: `Consider reviewing ${topic} to strengthen your understanding`,
      icon: 'alert-circle',
      action: '/weakness-analysis'
    })
  }

  /**
   * Notify user of new course recommendation
   */
  async notifyCourseRecommendation(userId, courseTitle) {
    await this.sendToUser(userId, {
      type: 'course_recommendation',
      title: 'New Course for You',
      message: `Based on your interests, check out ${courseTitle}`,
      icon: 'star',
      action: '/courses'
    })
  }

  /**
   * Broadcast system announcement
   */
  async broadcastAnnouncement(title, message) {
    await this.sendToAll({
      type: 'announcement',
      title,
      message,
      icon: 'megaphone',
      action: null
    })
  }
}

module.exports = new NotificationService()
