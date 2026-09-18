const express = require('express')
const { body, validationResult } = require('express-validator')
const Forum = require('../models/Forum')
const ForumPost = require('../models/ForumPost')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/forum
// @desc    Get all forums
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, course, search } = req.query
    
    let query = {}
    if (category) query.category = category
    if (course) query.course = course
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    const forums = await Forum.find(query)
      .populate('createdBy', 'name avatar')
      .populate('course', 'title')
      .sort({ isPinned: -1, updatedAt: -1 })
    
    res.json({ success: true, forums })
  } catch (error) {
    console.error('Get forums error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   GET /api/forum/:id
// @desc    Get single forum with posts
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('course', 'title')
    
    if (!forum) {
      return res.status(404).json({ success: false, message: 'Forum not found' })
    }
    
    // Get posts
    const posts = await ForumPost.find({ forum: req.params.id, parentPost: null })
      .populate('author', 'name avatar')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'name avatar' }
      })
      .sort({ isAcceptedAnswer: -1, createdAt: -1 })
    
    // Increment view count
    forum.views += 1
    await forum.save()
    
    res.json({ success: true, forum, posts })
  } catch (error) {
    console.error('Get forum error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/forum
// @desc    Create new forum
// @access  Private
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { title, description, course, category, tags } = req.body
    
    const forum = await Forum.create({
      title,
      description,
      course,
      category,
      tags,
      createdBy: req.user._id
    })
    
    // Create initial post
    const initialPost = await ForumPost.create({
      forum: forum._id,
      content: req.body.content,
      author: req.user._id
    })
    
    forum.posts.push(initialPost._id)
    await forum.save()
    
    res.status(201).json({ success: true, forum })
  } catch (error) {
    console.error('Create forum error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/forum/:id/posts
// @desc    Add post to forum
// @access  Private
router.post('/:id/posts', auth, [
  body('content').trim().notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { content, parentPost } = req.body
    
    const forum = await Forum.findById(req.params.id)
    if (!forum) {
      return res.status(404).json({ success: false, message: 'Forum not found' })
    }
    
    if (forum.isLocked) {
      return res.status(400).json({ success: false, message: 'Forum is locked' })
    }
    
    const post = await ForumPost.create({
      forum: req.params.id,
      content,
      author: req.user._id,
      parentPost
    })
    
    // If it's a reply, add to parent's replies
    if (parentPost) {
      const parent = await ForumPost.findById(parentPost)
      parent.replies.push(post._id)
      await parent.save()
    } else {
      forum.posts.push(post._id)
      await forum.save()
    }
    
    res.status(201).json({ success: true, post })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/forum/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }
    
    await post.toggleLike(req.user._id)
    
    res.json({ success: true, likes: post.likes.length })
  } catch (error) {
    console.error('Like post error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// @route   POST /api/forum/posts/:id/accept
// @desc    Mark post as accepted answer
// @access  Private
router.post('/posts/:id/accept', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }
    
    const forum = await Forum.findById(post.forum)
    
    // Check if user is forum creator
    if (forum.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    
    await post.markAsAccepted()
    
    res.json({ success: true, message: 'Post marked as accepted answer' })
  } catch (error) {
    console.error('Accept post error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
