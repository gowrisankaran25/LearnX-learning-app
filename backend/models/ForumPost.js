const mongoose = require('mongoose')

const forumPostSchema = new mongoose.Schema({
  forum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forum',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please provide post content'],
    maxlength: [2000, 'Content cannot be more than 2000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAcceptedAnswer: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  attachments: [{
    type: String
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

// Toggle like
forumPostSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId)
  if (likeIndex >= 0) {
    this.likes.splice(likeIndex, 1)
  } else {
    this.likes.push(userId)
  }
  return this.save()
}

// Mark as accepted answer
forumPostSchema.methods.markAsAccepted = function() {
  this.isAcceptedAnswer = true
  return this.save()
}

module.exports = mongoose.model('ForumPost', forumPostSchema)
