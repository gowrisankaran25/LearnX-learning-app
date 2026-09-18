import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Download,
  Copy,
  CheckCircle,
  X
} from 'lucide-react'
import { aiAPI } from '../../lib/api'
import toast from 'react-hot-toast'

export default function NotesAnalyzer() {
  const [file, setFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')

  const onDrop = useCallback(async (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0]
    setFile(uploadedFile)
    setAnalyzing(true)
    setResult(null)

    try {
      const response = await aiAPI.analyzeNotes(uploadedFile)
      const analysis = response.data?.analysis || response.data?.result || response.data
      if (analysis) {
        setResult(analysis)
        setAnalyzing(false)
        toast.success('Analysis complete!')
      } else {
        throw new Error('AI service returned no analysis')
      }
      /* setTimeout(() => {
        setResult({
          summary: `# Summary of Notes

This document covers the fundamental concepts of Computer Networks, focusing on the OSI model and TCP/IP protocol suite.

## Key Topics Covered:
- Network architecture and layers
- Protocol stacks and their functions
- Data transmission mechanisms
- Network security basics

## Main Takeaways:
1. The OSI model consists of 7 layers, each with specific responsibilities
2. TCP/IP is the practical implementation used in modern networks
3. Understanding layer interactions is crucial for troubleshooting`,
          
          keyPoints: [
            'OSI Model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application',
            'TCP/IP combines some OSI layers into 4 main layers',
            'Physical layer deals with actual data transmission over media',
            'Network layer handles routing and logical addressing',
            'Transport layer ensures end-to-end communication',
          ],
          
          flashcards: [
            { front: 'What are the 7 layers of the OSI model?', back: 'Physical, Data Link, Network, Transport, Session, Presentation, Application' },
            { front: 'Which layer handles routing?', back: 'Network Layer (Layer 3)' },
            { front: 'What is the purpose of the Transport layer?', back: 'End-to-end communication, flow control, and error recovery' },
            { front: 'How many layers does TCP/IP have?', back: '4 layers: Network Access, Internet, Transport, Application' },
          ],
          
          questions: [
            {
              question: 'Which OSI layer is responsible for routing?',
              options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Application Layer'],
              correct: 1,
              explanation: 'The Network Layer (Layer 3) is responsible for routing packets between networks.',
            },
            {
              question: 'TCP/IP combines which OSI layers into the Application layer?',
              options: ['Session and Presentation', 'Physical and Data Link', 'Network and Transport', 'All of the above'],
              correct: 0,
              explanation: 'TCP/IP combines the Session, Presentation, and Application layers of OSI into a single Application layer.',
            },
          ],
        })
        setAnalyzing(false)
        toast.success('Analysis complete!')
      }, 2000) */
    } catch (error) {
      console.error('Error analyzing notes:', error)
      setAnalyzing(false)
      toast.error('Failed to analyze notes')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  })

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Notes & Document Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your notes, PDFs, or presentations for AI-powered analysis
        </p>
      </div>

      {/* Upload Section */}
      {!file && (
        <div className="card max-w-3xl mx-auto">
          <div className="text-center mb-8">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4">
               <FileText className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Notes</h2>
             <p className="text-gray-500 mt-2">Drag & Drop your notes to generate study materials automatically.</p>
          </div>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-8 ${
              isDragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-primary-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {isDragActive ? 'Drop your file here' : 'Click to browse or drag & drop'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports PDF, PPTX, and TXT files (Max 10MB)
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI can automatically generate:
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {['Summary', 'Important Questions', 'Flashcards', 'MCQ Quiz', 'Exam Notes'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File Info & Analysis */}
      {file && !result && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {analyzing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Analyzing your document...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                This may take a moment
              </p>
            </div>
          ) : (
            <button
              onClick={() => onDrop([file])}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Analyze with AI
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['summary', 'keyPoints', 'flashcards', 'questions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.replace('keyPoints', 'Key Points')}
              </button>
            ))}
          </div>

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Summary</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(result.summary)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-5 h-5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDownload(result.summary, 'summary.txt')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                  {result.summary}
                </pre>
              </div>
            </div>
          )}

          {/* Key Points Tab */}
          {activeTab === 'keyPoints' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Key Points</h3>
                <button
                  onClick={() => handleCopy(result.keyPoints.join('\n'))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <ul className="space-y-3">
                {result.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Flashcards Tab */}
          {activeTab === 'flashcards' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Flashcards</h3>
                <button
                  onClick={() => handleDownload(
                    result.flashcards.map(f => `Q: ${f.front}\nA: ${f.back}`).join('\n\n'),
                    'flashcards.txt'
                  )}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {result.flashcards.map((card, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">
                      Q: {card.front}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      A: {card.back}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Practice Questions</h3>
                <span className="badge bg-primary-100 text-primary-700">
                  {result.questions.length} questions
                </span>
              </div>
              <div className="space-y-4">
                {result.questions.map((q, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="font-medium text-gray-900 dark:text-white mb-3">
                      {index + 1}. {q.question}
                    </p>
                    <div className="space-y-2 mb-3">
                      {q.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            optIndex === q.correct
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-50 dark:bg-gray-700'
                          }`}
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Explanation:</span> {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyze New File */}
          <button
            onClick={() => {
              setFile(null)
              setResult(null)
            }}
            className="btn-secondary w-full"
          >
            Analyze Another File
          </button>
        </div>
      )}
    </div>
  )
}
