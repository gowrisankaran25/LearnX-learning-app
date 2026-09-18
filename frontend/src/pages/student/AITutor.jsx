import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, Lightbulb, BookOpen, GraduationCap, ChevronDown, Check } from 'lucide-react'
import { aiAPI } from '../../lib/api'

export default function AITutor() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hi! I\'m your AI Learning Assistant. I can help you with:\n\n• Explaining difficult concepts\n• Generating practice questions\n• Summarizing study material\n• Answering your questions\n\nWhat would you like to learn today?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [level, setLevel] = useState('Beginner')
  const [showLevelMenu, setShowLevelMenu] = useState(false)
  const messagesEndRef = useRef(null)

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Exam Mode']

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
    }

    setMessages((currentMessages) => [...currentMessages, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await aiAPI.chat(input, `Student level: ${level}`)
      const aiResponse = {
        id: messages.length + 2,
        role: 'assistant',
        content: res.data?.response || 'I am sorry, I am not able to answer that right now.',
      }
      setMessages(prev => [...prev, aiResponse])
      setLoading(false)
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: error.response?.data?.message || 'I could not reach the tutor service. Please try again.',
      }])
      setLoading(false)
    }
  }

  const handleQuickAction = (action) => {
    const prompts = {
      explain: 'Can you explain this concept?',
      example: 'Can you give me a practical example?',
      quiz: 'Generate a practice question for me',
      summarize: 'Summarize the key points'
    }
    setInput(prompts[action])
  }

  return (
    <div className="ai-tutor-shell h-[calc(100vh-120px)] max-w-5xl mx-auto flex flex-col animate-fade-in">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-primary-500" />
            LearnX AI Tutor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your personal AI learning assistant
          </p>
        </div>
        
        {/* Explain at my level Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
             <GraduationCap className="w-4 h-4" /> Explain at my level:
          </div>
          <button 
            onClick={() => setShowLevelMenu(!showLevelMenu)}
            className="ai-level-trigger flex items-center justify-between w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium shadow-sm"
          >
            {level}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {showLevelMenu && (
            <div className="ai-level-menu absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => { setLevel(l); setShowLevelMenu(false) }}
                  className="ai-level-option w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                >
                  {l}
                  {level === l && <Check className="w-4 h-4 text-primary-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 card border-primary-100 dark:border-primary-900/50 shadow-sm overflow-hidden flex flex-col bg-gray-50/50 dark:bg-gray-900/20">
        <div className="ai-chat-scroll flex-1 overflow-y-scroll p-4 sm:p-6 space-y-6 custom-scrollbar">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {loading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl rounded-tl-none px-5 py-4">
                <div className="flex gap-1.5 items-center h-4">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1 py-1">Quick Actions:</span>
            <button
              onClick={() => handleQuickAction('explain')}
              className="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full hover:bg-indigo-100 transition-colors"
            >
              Explain
            </button>
            <button
              onClick={() => handleQuickAction('example')}
              className="text-xs font-medium px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full hover:bg-emerald-100 transition-colors"
            >
              Give Example
            </button>
            <button
              onClick={() => handleQuickAction('quiz')}
              className="text-xs font-medium px-3 py-1.5 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-full hover:bg-orange-100 transition-colors"
            >
              Quiz Me
            </button>
            <button
              onClick={() => handleQuickAction('summarize')}
              className="text-xs font-medium px-3 py-1.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full hover:bg-purple-100 transition-colors"
            >
              Summarize
            </button>
          </div>

          <div className="flex gap-3 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about your courses... 🎤"
              className="flex-1 input-field py-3 pr-12 shadow-sm"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
        isUser
          ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          : 'bg-gradient-to-br from-primary-500 to-accent-500'
      }`}>
        {isUser ? (
          <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${
        isUser
          ? 'bg-primary-600 text-white rounded-tr-none'
          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
      }`}>
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-sans">{message.content}</div>
      </div>
    </div>
  )
}
