const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a quiz title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  duration: {
    type: Number, // in seconds
    required: [true, 'Please provide quiz duration']
  },
  passingScore: {
    type: Number,
    default: 60,
    min: 0,
    max: 100
  },
  questions: [{
    type: {
      type: String,
      enum: ['mcq', 'truefalse', 'coding'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String
    }],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    explanation: String,
    points: {
      type: Number,
      default: 1
    },
    order: {
      type: Number,
      required: true
    }
  }],
  attempts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    answers: [mongoose.Schema.Types.Mixed],
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeTaken: Number // in seconds
  }],
  topic: {
    type: String,
    default: 'General'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  published: {
    type: Boolean,
    default: false
  },
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

// Calculate quiz score
quizSchema.methods.calculateScore = function(answers) {
  let correct = 0
  let totalPoints = 0
  
  this.questions.forEach((question) => {
    totalPoints += question.points
    const questionId = question._id.toString()
    const userAnswer = answers?.[questionId] ?? answers?.[questionId.toString()]
    
    if (question.type === 'mcq' || question.type === 'truefalse') {
      if (Number(userAnswer) === Number(question.correctAnswer)) {
        correct += question.points
      }
    } else if (question.type === 'coding') {
      // For coding questions, would need additional evaluation logic
      // For now, assume it's manually graded or evaluated by AI
    }
  })
  
  return totalPoints > 0 ? Math.round((correct / totalPoints) * 100) : 0
}

// Submit quiz attempt
quizSchema.methods.submitAttempt = function(userId, answers, timeTaken) {
  const score = this.calculateScore(answers)
  
  this.attempts.push({
    user: userId,
    score,
    answers,
    timeTaken
  })
  
  return this.save()
}

// Get user's best score
quizSchema.methods.getUserBestScore = function(userId) {
  const userAttempts = this.attempts.filter(
    attempt => attempt.user.toString() === userId.toString()
  )
  
  if (userAttempts.length === 0) return null
  
  return Math.max(...userAttempts.map(attempt => attempt.score))
}

module.exports = mongoose.model('Quiz', quizSchema)
