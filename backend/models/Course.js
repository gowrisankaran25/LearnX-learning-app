const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Programming', 'Database', 'Networking', 'AI/ML', 'Web Development', 'Other']
  },
  level: {
    type: String,
    required: [true, 'Please provide a difficulty level'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  thumbnail: {
    type: String,
    default: null
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please provide course duration']
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  prerequisites: [{
    type: String
  }],
  whatYouLearn: [{
    type: String,
    maxlength: [200, 'Learning outcome cannot be more than 200 characters']
  }],
  price: {
    type: Number,
    default: 0
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  tags: [{
    type: String,
    lowercase: true
  }],
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

// Update rating when new review is added
courseSchema.methods.addReview = function(userId, rating, comment) {
  const existingReview = this.rating.reviews.find(
    review => review.user.toString() === userId.toString()
  )
  
  if (existingReview) {
    // Update existing review
    const oldRating = existingReview.rating
    existingReview.rating = rating
    existingReview.comment = comment
    
    // Recalculate average
    this.rating.average = 
      ((this.rating.average * this.rating.count) - oldRating + rating) / this.rating.count
  } else {
    // Add new review
    this.rating.reviews.push({ user: userId, rating, comment })
    this.rating.count += 1
    
    // Recalculate average
    this.rating.average = 
      ((this.rating.average * (this.rating.count - 1)) + rating) / this.rating.count
  }
  
  return this.save()
}

// Get course progress for a student
courseSchema.methods.getStudentProgress = function(userId) {
  const completedLessons = this.lessons.filter(lesson => 
    lesson.completedBy && lesson.completedBy.includes(userId)
  ).length
  
  return {
    totalLessons: this.lessons.length,
    completedLessons,
    percentage: this.lessons.length > 0 
      ? Math.round((completedLessons / this.lessons.length) * 100) 
      : 0
  }
}

module.exports = mongoose.model('Course', courseSchema)
