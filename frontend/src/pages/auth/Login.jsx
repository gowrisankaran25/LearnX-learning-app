import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await login(formData)
    if (success) {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
      navigate(storedUser?.role === 'teacher' ? '/teacher' : storedUser?.role === 'admin' ? '/admin' : '/student')
    }
  }

  return (
    <div className="min-h-screen app-shell flex items-center justify-center p-6 overflow-hidden relative">
      {/* 3D Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating 3D Cubes */}
        <div className="absolute top-20 left-20 w-20 h-20 bg-primary-200/30 rounded-lg animate-float-3d" style={{ animationDelay: '0s' }}>
          <div className="absolute inset-0 bg-primary-300/20 rounded-lg transform rotate-12"></div>
        </div>
        <div className="absolute top-40 right-32 w-16 h-16 bg-accent-200/30 rounded-lg animate-float-3d" style={{ animationDelay: '2s' }}>
          <div className="absolute inset-0 bg-accent-300/20 rounded-lg transform -rotate-12"></div>
        </div>
        <div className="absolute bottom-32 left-40 w-24 h-24 bg-primary-200/30 rounded-lg animate-float-3d" style={{ animationDelay: '4s' }}>
          <div className="absolute inset-0 bg-primary-300/20 rounded-lg transform rotate-6"></div>
        </div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-accent-200/30 rounded-lg animate-float-3d" style={{ animationDelay: '1s' }}>
          <div className="absolute inset-0 bg-accent-300/20 rounded-lg transform -rotate-6"></div>
        </div>
        
        {/* 3D Spheres */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full animate-pulse-3d opacity-40"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-accent-100 to-primary-100 rounded-full animate-pulse-3d opacity-30" style={{ animationDelay: '3s' }}></div>
        
        {/* Rotating 3D Rings */}
        <div className="absolute top-1/3 right-1/3 w-48 h-48 border-4 border-primary-200/30 rounded-full animate-spin-3d-slow opacity-30"></div>
        <div className="absolute bottom-1/3 left-1/3 w-36 h-36 border-4 border-accent-200/30 rounded-full animate-spin-3d-reverse-login opacity-25" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#f07a61] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[5px_5px_0_#123c3b]">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#17212b] tracking-tight animate-slide-up">Welcome back</h1>
          <p className="text-gray-600 mt-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>Sign in to continue learning</p>
        </div>

        <div className="card shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-10 group-hover:shadow-lg transition-all duration-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pl-10 pr-10 group-hover:shadow-lg transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full animate-slide-up hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: '0.5s' }}
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
