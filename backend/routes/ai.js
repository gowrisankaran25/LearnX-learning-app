const express = require('express')
const axios = require('axios')
const multer = require('multer')
const FormData = require('form-data')
const fs = require('fs')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = ['application/pdf', 'text/plain', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
    callback(null, allowed.includes(file.mimetype))
  }
})

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// Mock AI responses for development
const mockAIResponses = {
  chat: (message, context) => {
    const lowerMessage = message.toLowerCase()
    const subjectAnswers = [
      {
        terms: ['tcp', 'ip', 'http', 'dns', 'network', 'protocol', 'osi'],
        answer: `**Networking answer**\n\nA network protocol is a defined set of rules that devices use to communicate.\n\n- **IP** addresses and routes packets between devices.\n- **TCP** provides reliable, ordered delivery and retransmits lost packets.\n- **HTTP** carries web requests and responses.\n- **DNS** translates domain names such as example.com into IP addresses.\n\nA typical web request uses DNS to find the server, TCP to establish reliable delivery, and HTTP to transfer the page.`,
      },
      {
        terms: ['java', 'variable', 'array', 'oop', 'class', 'object', 'inheritance', 'polymorphism'],
        answer: `**Java answer**\n\nJava is a strongly typed, object-oriented language. A variable stores a value with a declared type, for example \`int score = 90;\`.\n\n- An **array** stores a fixed-size sequence of values of one type.\n- A **class** defines data and behavior.\n- An **object** is an instance of a class.\n- **Inheritance** reuses behavior from a parent class.\n- **Polymorphism** lets one interface work with different object types.`,
      },
      {
        terms: ['sql', 'database', 'dbms', 'normalization', 'table', 'query', 'index'],
        answer: `**Database answer**\n\nA database stores structured data in tables made of rows and columns. SQL is used to query and change that data.\n\n- \`SELECT\` reads rows.\n- \`INSERT\` adds rows.\n- \`UPDATE\` changes rows.\n- \`DELETE\` removes rows.\n- An **index** speeds up lookups, but adds storage and can slow writes.\n- **Normalization** reduces duplicated data by separating related facts into connected tables.`,
      },
      {
        terms: ['python', 'machine learning', 'ai', 'artificial intelligence', 'model'],
        answer: `**AI and Python answer**\n\nPython is widely used in AI because its syntax is readable and its ecosystem includes NumPy, pandas, scikit-learn, and PyTorch. A machine-learning model learns patterns from examples, then uses those patterns to make predictions on new data. Always separate training data from evaluation data so you can measure generalization.`,
      },
    ]

    const matchedSubject = subjectAnswers.find((entry) => entry.terms.some((term) => lowerMessage.includes(term)))
    if (matchedSubject) return matchedSubject.answer

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your AI Learning Assistant. How can I help you today? I can explain concepts, generate practice questions, or help you with your studies."
    }
    if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
      return `Great question! Let me explain that concept for you. ${message} is an important topic. In simple terms, it's about understanding the fundamental principles and how they apply in practice. Would you like me to break it down further or provide examples?`
    }
    if (lowerMessage.includes('quiz') || lowerMessage.includes('question') || lowerMessage.includes('practice')) {
      return "I'd be happy to generate some practice questions for you! What topic would you like to practice? I can create multiple choice questions, true/false, or coding challenges."
    }
    if (lowerMessage.includes('summarize') || lowerMessage.includes('summary')) {
      return "I can help you summarize content! Please provide the text you'd like me to summarize, and I'll create a concise summary highlighting the key points."
    }
    return `Thanks for your question about "${message}". As your AI Learning Assistant, I'm here to help you understand concepts, practice with questions, and improve your learning. Could you be more specific about what you'd like help with?`
  },
  explain: (topic) => `Here's an explanation of **${topic}**:

## Overview
${topic} is a fundamental concept that plays a crucial role in understanding the broader subject area.

## Key Points
1. **Definition**: ${topic} refers to the core principles and mechanisms involved
2. **Importance**: Understanding ${topic} helps you build a strong foundation
3. **Applications**: This concept is used in various real-world scenarios

## Simple Analogy
Think of ${topic} like learning to ride a bike - once you understand the balance and mechanics, you can apply it to more complex situations.

## Next Steps
- Practice with related exercises
- Explore advanced topics that build on this concept
- Ask follow-up questions if anything is unclear!`,
  generateQuestions: (topic, count) => {
    const questions = []
    for (let i = 0; i < Math.min(count, 5); i++) {
      questions.push({
        question: `Sample question ${i + 1} about ${topic}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `This is the explanation for question ${i + 1}. The correct answer demonstrates understanding of ${topic}.`,
        type: 'mcq'
      })
    }
    return questions
  },
  summarize: (content) => `Summary of the provided content:

**Key Takeaways:**
- The content covers important concepts related to the topic
- Main points are structured in a logical progression
- Practical applications are highlighted

**Summary:**
${content.substring(0, 200)}... [This is a mock summary. Connect to AI service for full analysis.]`
}

// @route   POST /api/ai/chat
// @desc    Chat with AI tutor
// @access  Private
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body
    
    // Try to call AI service
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/chat`, {
        message,
        context,
        userId: req.user._id
      }, { timeout: 5000 })

      if (!response.data?.response || /trouble connecting|service unavailable|try again later/i.test(response.data.response)) {
        throw new Error('AI service returned an unavailable response')
      }
      
      return res.json({
        success: true,
        response: response.data.response
      })
    } catch (serviceError) {
      // Use mock response if AI service is unavailable
      console.log('AI service unavailable, using mock response')
      return res.json({
        success: true,
        response: mockAIResponses.chat(message, context)
      })
    }
  } catch (error) {
    console.error('AI chat error:', error)
    res.json({
      success: true,
      response: 'I apologize, but I\'m having trouble processing your request. Please try again.'
    })
  }
})

// @route   POST /api/ai/explain
// @desc    Get AI explanation for a topic
// @access  Private
router.post('/explain', auth, async (req, res) => {
  try {
    const { topic } = req.body
    
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/explain`, {
        topic,
        userId: req.user._id
      }, { timeout: 5000 })
      
      return res.json({
        success: true,
        explanation: response.data.explanation
      })
    } catch (serviceError) {
      console.log('AI service unavailable, using mock response')
      return res.json({
        success: true,
        explanation: mockAIResponses.explain(topic)
      })
    }
  } catch (error) {
    console.error('AI explain error:', error)
    res.json({
      success: true,
      explanation: `Here's a simple explanation of ${topic}: [AI service unavailable]`
    })
  }
})

// @route   POST /api/ai/generate-questions
// @desc    Generate practice questions
// @access  Private
router.post('/generate-questions', auth, async (req, res) => {
  try {
    const { topic, count = 5 } = req.body
    
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/generate-questions`, {
        topic,
        count,
        userId: req.user._id
      }, { timeout: 5000 })
      
      return res.json({
        success: true,
        questions: response.data.questions
      })
    } catch (serviceError) {
      console.log('AI service unavailable, using mock response')
      return res.json({
        success: true,
        questions: mockAIResponses.generateQuestions(topic, count)
      })
    }
  } catch (error) {
    console.error('AI generate questions error:', error)
    res.json({
      success: true,
      questions: []
    })
  }
})

// @route   POST /api/ai/summarize
// @desc    Summarize content
// @access  Private
router.post('/summarize', auth, async (req, res) => {
  try {
    const { content } = req.body
    
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/summarize`, {
        content
      }, { timeout: 5000 })
      
      return res.json({
        success: true,
        summary: response.data.summary
      })
    } catch (serviceError) {
      console.log('AI service unavailable, using mock response')
      return res.json({
        success: true,
        summary: mockAIResponses.summarize(content)
      })
    }
  } catch (error) {
    console.error('AI summarize error:', error)
    res.json({
      success: true,
      summary: 'Summary service unavailable'
    })
  }
})

// @route   POST /api/ai/analyze-notes
// @desc    Analyze uploaded notes/PDF
// @access  Private
router.post('/analyze-notes', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }
    
    try {
      const formData = new FormData()
      formData.append('file', fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      })
      
      const response = await axios.post(`${AI_SERVICE_URL}/analyze-notes`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 10000
      })

      fs.unlink(req.file.path, () => {})
      
      return res.json({
        success: true,
        analysis: response.data
      })
    } catch (serviceError) {
      fs.unlink(req.file.path, () => {})
      console.log('AI service unavailable, using mock response')
      return res.json({
        success: true,
        analysis: {
          summary: `Analysis of ${req.file.originalname}`,
          keyPoints: ['Key point 1 from document', 'Key point 2 from document', 'Key point 3 from document'],
          flashcards: [
            { front: 'What is the main topic?', back: 'The document covers important concepts' },
            { front: 'Key concept?', back: 'Core principles and applications' }
          ],
          questions: [
            { question: 'What was the main focus?', options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'], correct: 0, explanation: 'The document focuses on Topic A' }
          ]
        }
      })
    }
  } catch (error) {
    console.error('AI analyze notes error:', error)
    res.status(500).json({ success: false, message: 'Analysis failed' })
  }
})

module.exports = router
