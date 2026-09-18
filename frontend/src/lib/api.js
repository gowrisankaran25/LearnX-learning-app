import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleLogin: (token) => api.post('/auth/google', { token }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  getProgress: (id) => api.get(`/courses/${id}/progress`),
}

export const lessonAPI = {
  getById: (id) => api.get(`/lessons/${id}`),
  complete: (id) => api.post(`/lessons/${id}/complete`),
}

export const quizAPI = {
  getById: (id) => api.get(`/quizzes/${id}`),
  submit: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
  getHistory: () => api.get('/quizzes/history'),
}

export const aiAPI = {
  chat: (message, context) => api.post('/ai/chat', { message, context }),
  explain: (topic) => api.post('/ai/explain', { topic }),
  generateQuestions: (topic, count) => api.post('/ai/generate-questions', { topic, count }),
  summarize: (content) => api.post('/ai/summarize', { content }),
  analyzeNotes: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/ai/analyze-notes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getLearningDNA: () => api.get('/users/learning-dna'),
  getProgress: () => api.get('/users/progress'),
  getWeaknesses: () => api.get('/users/weaknesses'),
  getRecommendations: () => api.get('/users/recommendations'),
  getAchievements: () => api.get('/users/achievements'),
}

export const recommendationAPI = {
  getLearningPath: () => api.get('/recommendations/learning-path'),
  getDailyGoals: () => api.get('/recommendations/daily-goals'),
  getCourses: (limit = 5) => api.get(`/recommendations/courses?limit=${limit}`),
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getCourses: () => api.get('/admin/courses'),
}

export const leaderboardAPI = {
  getGlobal: () => api.get('/leaderboard/global'),
  getCourse: (courseId) => api.get(`/leaderboard/course/${courseId}`),
}

export const teacherAPI = {
  createCourse: (data) => api.post('/teacher/courses', data),
  updateCourse: (id, data) => api.put(`/teacher/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/teacher/courses/${id}`),
  createLesson: (courseId, data) => api.post(`/teacher/courses/${courseId}/lessons`, data),
  createQuiz: (courseId, data) => api.post(`/teacher/courses/${courseId}/quizzes`, data),
  getStudents: () => api.get('/teacher/students'),
  getStudentProgress: (studentId) => api.get(`/teacher/students/${studentId}/progress`),
}

export default api
