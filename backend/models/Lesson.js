const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a lesson title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Please provide a video URL']
  },
  videoDuration: {
    type: Number, // in seconds
    required: [true, 'Please provide video duration']
  },
  order: {
    type: Number,
    required: [true, 'Please provide lesson order']
  },
  transcript: {
    type: String
  },
  notes: {
    type: String
  },
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['pdf', 'link', 'code']
    },
    url: String
  }],
  completedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Mark lesson as completed by user
lessonSchema.methods.markCompleted = function(userId) {
  if (!this.completedBy.includes(userId)) {
    this.completedBy.push(userId)
    return this.save()
  }
  return Promise.resolve(this)
}

module.exports = mongoose.model('Lesson', lessonSchema)
