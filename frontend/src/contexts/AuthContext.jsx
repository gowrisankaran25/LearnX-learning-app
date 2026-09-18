import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await authAPI.me()
        setUser(response.data.user || response.data)
      }
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login({
        ...credentials,
        email: credentials.email.trim().toLowerCase(),
      })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setUser(response.data.user)
      toast.success('Login successful!')
      return true
    } catch (error) {
      const message = error.response?.data?.message
        || (error.request ? 'Cannot reach the login server. Check that the backend is running.' : 'Login failed')
      toast.error(message)
      return false
    }
  }

  const googleLogin = async (credential) => {
    try {
      const response = await authAPI.googleLogin(credential)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setUser(response.data.user)
      toast.success('Google Login successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google Login failed')
      return false
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setUser(response.data.user)
      toast.success('Registration successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return false
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      toast.success('Logged out successfully')
    }
  }

  const updateUser = (updates) => {
    setUser((currentUser) => currentUser ? { ...currentUser, ...updates } : currentUser)
  }

  const value = {
    user,
    loading,
    login,
    googleLogin,
    register,
    updateUser,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
