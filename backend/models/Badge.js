const mongoose = require('mongoose')

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a badge name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a badge description']
  },
  icon: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['achievement', 'streak', 'completion', 'skill', 'social'],
    required: true
  },
  requirements: {
    type: {
      type: String,
      enum: ['lessons_completed', 'quizzes_passed', 'streak_days', 'courses_completed', 'xp_earned'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    additionalCriteria: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  xpReward: {
    type: Number,
    default: 0
  },
  awardedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Check if user meets badge requirements
badgeSchema.methods.checkRequirements = function(user) {
  const { type, value, additionalCriteria } = this.requirements
  
  switch (type) {
    case 'lessons_completed':
      return user.completedLessons.length >= value
    case 'quizzes_passed':
      const passedQuizzes = user.quizAttempts.filter(
        attempt => attempt.score >= 60
      ).length
      return passedQuizzes >= value
    case 'streak_days':
      return user.gamification.streak >= value
    case 'courses_completed':
      // Would need to implement course completion logic
      return false
    case 'xp_earned':
      return user.gamification.xp >= value
    default:
      return false
  }
}

// Award badge to user
badgeSchema.methods.awardTo = function(userId) {
  if (!this.awardedTo.includes(userId)) {
    this.awardedTo.push(userId)
    return this.save()
  }
  return Promise.resolve(this)
}

module.exports = mongoose.model('Badge', badgeSchema)
