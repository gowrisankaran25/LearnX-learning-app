import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Trophy,
  User,
  Settings,
  GraduationCap,
  Sparkles,
  Lightbulb,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
  BarChart2,
  Target,
  Brain
} from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Sidebar({ user }) {
  const [collapsed, setCollapsed] = useState(false)

  const studentGroups = [
    {
      title: 'Main',
      links: [
        { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
        { to: '/student/ai-tutor', icon: MessageSquare, label: 'AI Tutor' },
        { to: '/student/learning-path', icon: TrendingUp, label: 'Learning Path' },
      ]
    },
    {
      title: 'AI Features',
      links: [
        { to: '/student/weakness-analysis', icon: FileText, label: 'Weakness Analysis' },
        { to: '/student/notes-analyzer', icon: BookOpen, label: 'Notes Analyzer' },
        { to: '/student/ai-tutor', icon: Sparkles, label: 'AI Quiz Generator' },
        { to: '/student/learning-path', icon: Lightbulb, label: 'Recommendations' },
      ]
    },
    {
      title: 'Progress',
      links: [
        { to: '/student/analytics', icon: BarChart2, label: 'Analytics' },
        { to: '/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { to: '/student/achievements', icon: Award, label: 'Achievements' },
      ]
    },
    {
      title: 'Account',
      links: [
        { to: '/student/profile', icon: User, label: 'Profile' },
        { to: '/student/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ]

  const teacherLinks = [
    { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/teacher/students', icon: GraduationCap, label: 'Students' },
    { to: '/teacher/analytics', icon: TrendingUp, label: 'Analytics' },
  ]

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: User, label: 'Users' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside 
      className={cn(
        "sidebar-shell relative bg-[#123c3b] border-r border-[#0b302f] min-h-screen p-4 pb-24 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("flex items-center mb-8", collapsed ? "justify-center" : "gap-3 px-2 justify-between")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f07a61] rounded-lg flex items-center justify-center shrink-0 shadow-[3px_3px_0_#082d2c]">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-xl text-[#fffdf8] tracking-tight">LearnX</h1>
              <p className="text-xs text-[#a8cbc3]">AI Learning Studio</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 bg-[#fffdf8] border border-[#d5ddd7] rounded-full p-1 text-[#123c3b] hover:text-[#ef765f] z-10 hidden md:block shadow-sm"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <nav className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
        {user?.role === 'student' || !user ? (
          studentGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <h3 className="px-3 text-[10px] font-semibold text-[#8ebbb2] uppercase tracking-[0.16em] mb-2">
                  {group.title}
                </h3>
              )}
              {group.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  title={collapsed ? link.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-[#f07a61] text-[#fffdf8] shadow-[3px_3px_0_#082d2c]'
                        : 'text-[#c6ddd8] hover:bg-[#1b5652] hover:text-white',
                      collapsed && 'justify-center px-2'
                    )
                  }
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap">{link.label}</span>}
                </NavLink>
              ))}
            </div>
          ))
        ) : (
          <div className="space-y-1">
            {(user?.role === 'teacher' ? teacherLinks : adminLinks).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                title={collapsed ? link.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-[#f07a61] text-[#fffdf8] shadow-[3px_3px_0_#082d2c]'
                      : 'text-[#c6ddd8] hover:bg-[#1b5652] hover:text-white',
                    collapsed && 'justify-center px-2'
                  )
                }
              >
                <link.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-[#f3c969] rounded-lg p-4 text-[#173b3a] shadow-[3px_3px_0_#082d2c]">
            <p className="font-extrabold text-sm">Make a study sprint</p>
            <p className="text-xs opacity-80 mt-1">Your next breakthrough is 15 minutes away.</p>
          </div>
        </div>
      )}
    </aside>
  )
}
