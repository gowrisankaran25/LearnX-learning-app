import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import StudentDashboard from './pages/student/Dashboard'
import CourseExplorer from './pages/student/CourseExplorer'
import CourseDetails from './pages/student/CourseDetails'
import LessonPlayer from './pages/student/LessonPlayer'
import AITutor from './pages/student/AITutor'
import Quiz from './pages/student/Quiz'
import QuizResult from './pages/student/QuizResult'
import WeaknessAnalysis from './pages/student/WeaknessAnalysis'
import LearningPath from './pages/student/LearningPath'
import NotesAnalyzer from './pages/student/NotesAnalyzer'
import ProgressAnalytics from './pages/student/ProgressAnalytics'
import Leaderboard from './pages/student/Leaderboard'
import Achievements from './pages/student/Achievements'
import Profile from './pages/student/Profile'
import Settings from './pages/student/Settings'
import TeacherDashboard from './pages/teacher/Dashboard'
import AdminPanel from './pages/admin/AdminPanel'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Student routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<CourseExplorer />} />
              <Route path="courses/:id" element={<CourseDetails />} />
              <Route path="lessons/:id" element={<LessonPlayer />} />
              <Route path="ai-tutor" element={<AITutor />} />
              <Route path="quiz/:id" element={<Quiz />} />
              <Route path="quiz/:id/result" element={<QuizResult />} />
              <Route path="weakness-analysis" element={<WeaknessAnalysis />} />
              <Route path="learning-path" element={<LearningPath />} />
              <Route path="notes-analyzer" element={<NotesAnalyzer />} />
              <Route path="analytics" element={<ProgressAnalytics />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Teacher routes */}
            <Route path="/teacher" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<TeacherDashboard />} />
            </Route>
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminPanel />} />
            </Route>
            
            {/* Direct aliases for convenience */}
            <Route path="/profile" element={<Navigate to="/student/profile" replace />} />
            <Route path="/achievements" element={<Navigate to="/student/achievements" replace />} />
            <Route path="/settings" element={<Navigate to="/student/settings" replace />} />
            <Route path="/dashboard" element={<Navigate to="/student" replace />} />
            <Route path="/courses" element={<Navigate to="/student/courses" replace />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
