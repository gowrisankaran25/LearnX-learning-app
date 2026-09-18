const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  learningGoals: [{
    type: String,
    maxlength: [100, 'Goal cannot be more than 100 characters']
  }],
  // Learning DNA
  learningDNA: {
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
      default: 'visual'
    },
    strongAreas: [{
      topic: String,
      score: Number
    }],
    weakAreas: [{
      topic: String,
      score: Number,
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      }
    }],
    averageQuizScore: {
      type: Number,
      default: 0
    },
    consistency: {
      type: Number,
      default: 0
    },
    recommendedDifficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    }
  },
  // Gamification
  gamification: {
    xp: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    streak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    badges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    }],
    lastActiveDate: {
      type: Date,
      default: Date.now
    }
  },
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: false
    },
    dailyReminders: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'english'
    }
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  completedLessons: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  quizAttempts: [{
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    score: Number,
    answers: [mongoose.Schema.Types.Mixed],
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Update learning DNA based on quiz performance
userSchema.methods.updateLearningDNA = function(quizResult) {
  const { topic, score } = quizResult
  
  // Update average quiz score
  const totalAttempts = this.quizAttempts.length
  this.learningDNA.averageQuizScore = 
    ((this.learningDNA.averageQuizScore * (totalAttempts - 1)) + score) / totalAttempts
  
  // Update strong/weak areas
  const strongAreaIndex = this.learningDNA.strongAreas.findIndex(
    area => area.topic === topic
  )
  const weakAreaIndex = this.learningDNA.weakAreas.findIndex(
    area => area.topic === topic
  )
  
  if (score >= 75) {
    if (strongAreaIndex >= 0) {
      this.learningDNA.strongAreas[strongAreaIndex].score = score
    } else {
      this.learningDNA.strongAreas.push({ topic, score })
    }
    // Remove from weak areas if present
    if (weakAreaIndex >= 0) {
      this.learningDNA.weakAreas.splice(weakAreaIndex, 1)
    }
  } else if (score < 60) {
    if (weakAreaIndex >= 0) {
      this.learningDNA.weakAreas[weakAreaIndex].score = score
    } else {
      this.learningDNA.weakAreas.push({ 
        topic, 
        score,
        priority: score < 50 ? 'high' : 'medium'
      })
    }
    // Remove from strong areas if present
    if (strongAreaIndex >= 0) {
      this.learningDNA.strongAreas.splice(strongAreaIndex, 1)
    }
  }
  
  // Update recommended difficulty based on overall performance
  if (this.learningDNA.averageQuizScore >= 85) {
    this.learningDNA.recommendedDifficulty = 'advanced'
  } else if (this.learningDNA.averageQuizScore >= 60) {
    this.learningDNA.recommendedDifficulty = 'intermediate'
  } else {
    this.learningDNA.recommendedDifficulty = 'beginner'
  }
  
  return this.save()
}

// Add XP and check for level up
userSchema.methods.addXP = function(amount) {
  this.gamification.xp += amount
  
  // Level up formula: level = sqrt(xp / 100)
  const newLevel = Math.floor(Math.sqrt(this.gamification.xp / 100)) + 1
  
  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel
    // Could trigger badge award here
  }
  
  return this.save()
}

// Update streak
userSchema.methods.updateStreak = function() {
  const today = new Date()
  const lastActive = this.gamification.lastActiveDate
  
  // Calculate days difference
  const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24))
  
  if (daysDiff === 1) {
    // Consecutive day
    this.gamification.streak += 1
    if (this.gamification.streak > this.gamification.longestStreak) {
      this.gamification.longestStreak = this.gamification.streak
    }
  } else if (daysDiff > 1) {
    // Streak broken
    this.gamification.streak = 1
  }
  
  this.gamification.lastActiveDate = today
  return this.save()
}

module.exports = mongoose.model('User', userSchema)
