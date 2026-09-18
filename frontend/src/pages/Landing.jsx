import { Link } from 'react-router-dom'
import { GraduationCap, Brain, TrendingUp, Trophy, Zap, Users, BookOpen, ArrowRight } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen app-shell overflow-hidden relative">
      {/* 3D Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating 3D Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200/20 rounded-full animate-float-3d-1"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent-200/20 rounded-full animate-float-3d-2"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-primary-100/30 rounded-full animate-float-3d-3"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-accent-100/30 rounded-full animate-float-3d-4"></div>
        
        {/* 3D Geometric Shapes */}
        <div className="absolute top-1/3 left-1/5 w-16 h-16 border-4 border-primary-200/30 rotate-45 animate-spin-3d-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-20 h-20 border-4 border-accent-200/30 rounded-full animate-pulse-3d"></div>
      </div>

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f07a61] rounded-lg flex items-center justify-center shadow-[3px_3px_0_#123c3b]">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-[#17212b] tracking-tight">LearnX</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="btn-primary animate-button-3d hover:scale-105 transition-transform"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#dceee9] text-[#07584f] px-4 py-2 rounded-full text-sm font-bold mb-6 animate-slide-up">
            <Zap className="w-4 h-4" />
            AI-Powered Personalized Learning
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#17212b] mb-6 leading-tight tracking-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Learn Smarter with Your
            <span className="text-[#087f73]">
              {' '}AI Learning DNA
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            An intelligent platform that understands your learning level, identifies weak areas, 
            and creates personalized learning paths tailored just for you.
          </p>
          <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/register" className="btn-primary text-lg px-8 py-3 animate-button-3d hover:scale-105 transition-transform">
              Start Learning Free
            </Link>
            <button className="btn-secondary text-lg px-8 py-3 animate-button-3d hover:scale-105 transition-transform">
              Watch Demo
            </button>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>10,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>500+ Courses</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>95% Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with 3D Flashing Cards */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-slide-up">
            Everything You Need to Excel
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Comprehensive features designed to accelerate your learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard3D
            icon={Brain}
            title="AI Learning Assistant"
            description="Ask questions in natural language, get instant explanations, and generate practice questions"
            delay="0.2s"
          />
          <FeatureCard3D
            icon={TrendingUp}
            title="Personalized Learning Path"
            description="AI analyzes your performance and creates a custom learning path: Learn → Practice → Test → Improve"
            delay="0.3s"
          />
          <FeatureCard3D
            icon={Trophy}
            title="Smart Quizzes"
            description="MCQs, True/False, coding questions with automatic evaluation and instant explanations"
            delay="0.4s"
          />
          <FeatureCard3D
            icon={Zap}
            title="Weakness Detection"
            description="Automatically identifies weak topics and recommends targeted learning material"
            delay="0.5s"
          />
          <FeatureCard3D
            icon={BookOpen}
            title="Notes Analyzer"
            description="Upload PDFs/PPTs and get AI-generated summaries, flashcards, and practice questions"
            delay="0.6s"
          />
          <FeatureCard3D
            icon={Users}
            title="Gamification"
            description="Earn XP points, badges, maintain streaks, and compete on leaderboards"
            delay="0.7s"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="bg-[#123c3b] rounded-2xl p-12 text-center text-white shadow-[6px_6px_0_#f07a61]">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already learning smarter with LearnX
          </p>
          <Link
            to="/register"
            className="inline-block bg-[#f3c969] text-[#173b3a] font-bold px-8 py-3 rounded-lg hover:bg-[#fff0b6] transition-colors"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-200 relative z-10">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>© 2024 LearnX. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard3D({ icon: Icon, title, description, delay }) {
  return (
    <div 
      className="card group hover:-translate-y-1 transition-all duration-300"
      style={{ animationDelay: delay }}
    >
      <div className="w-14 h-14 bg-[#dceee9] rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[#087f73]" />
      </div>
      <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      <div className="flex items-center text-[#087f73] font-bold text-sm cursor-pointer">
        Learn more <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  )
}
