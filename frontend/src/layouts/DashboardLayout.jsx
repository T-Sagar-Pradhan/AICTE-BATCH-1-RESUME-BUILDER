import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, BarChart3, Briefcase,
  MessageSquare, Globe, Brain, Settings, LogOut,
  ChevronLeft, ChevronRight, Search, Crown,
  Zap, Menu, TrendingUp, Users
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { clsx } from 'clsx'
import AnimatedBackground from '../components/ui/AnimatedBackground'

const navItems = [
  { label: 'Dashboard',       path: '/dashboard',       icon: LayoutDashboard },
  { label: 'Resume Builder',  path: '/resume-builder',  icon: FileText },
  { label: 'ATS Analyzer',    path: '/ats-analyzer',    icon: BarChart3 },
  { label: 'Cover Letter',    path: '/cover-letter',    icon: Briefcase },
  { label: 'Portfolio',       path: '/portfolio',       icon: Globe },
  { label: 'Interview Prep',  path: '/interview-prep',  icon: Brain },
  { label: 'Career Advisor',  path: '/career-advisor',  icon: MessageSquare },
]

const adminItems = [
  { label: 'Admin Panel',     path: '/admin',            icon: Users },
  { label: 'Analytics',       path: '/admin/analytics',  icon: TrendingUp },
]

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-5 border-b border-dark-700',
        collapsed && 'justify-center px-2'
      )}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/30">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-dark-50 text-sm tracking-tight">
            CareerForge<span className="text-brand-400"> AI</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-hide">
        <div className="space-y-0.5">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'sidebar-link',
                isActive(path) && 'active',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </div>

        {isAdmin && (
          <>
            <div className={clsx('mt-6 mb-2 px-3', collapsed && 'text-center')}>
              {!collapsed && (
                <p className="text-xs font-semibold text-dark-600 uppercase tracking-widest">Admin</p>
              )}
            </div>
            <div className="space-y-0.5">
              {adminItems.map(({ label, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'sidebar-link',
                    isActive(path) && 'active',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Upgrade banner */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-brand-600/20 to-violet-600/20 border border-brand-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Crown size={14} className="text-amber-400" />
            <span className="text-xs font-semibold text-dark-200">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-dark-500 mb-2">Unlock unlimited AI features</p>
          <Link
            to="/pricing"
            className="block w-full text-center py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}

      {/* User / Logout */}
      <div className={clsx(
        'border-t border-dark-700 p-3',
        collapsed ? 'flex justify-center' : 'flex items-center gap-3'
      )}>
        {user?.profile_photo ? (
          <img src={user.profile_photo} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
            {user?.fullname?.[0]?.toUpperCase()}
          </div>
        )}
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-100 truncate">{user?.fullname}</p>
            <p className="text-xs text-dark-500 truncate">{user?.email}</p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={logout}
            className="p-1.5 text-dark-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Vignette overlay */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5,8,22,0.8) 100%)'
      }} />
      {/* Desktop Sidebar */}
      <aside
        style={{ width: collapsed ? 64 : 240 }}
        className="hidden lg:flex flex-col relative flex-shrink-0 transition-all duration-300 z-10"
      >
        <div className="absolute inset-0 border-r border-white/[0.04]" style={{ background: 'rgba(5, 8, 22, 0.85)', backdropFilter: 'blur(24px)' }} />
        <div className="relative z-10 flex flex-col h-full">
          <SidebarContent />
        </div>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-16 z-10 w-7 h-7 bg-dark-700 border border-dark-600 rounded-full flex items-center justify-center text-dark-400 hover:text-dark-100 transition-colors shadow-lg"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden transition-transform"
            style={{ background: 'rgba(5, 8, 22, 0.95)', backdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255,255,255,0.04)' }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/[0.04] flex items-center px-4 gap-3 flex-shrink-0 z-10" style={{ background: 'rgba(5, 8, 22, 0.7)', backdropFilter: 'blur(20px)' }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
              <input
                placeholder="Search anything…"
                className="w-full pl-9 pr-4 py-2 bg-dark-700/50 border border-dark-700 text-dark-300 placeholder-dark-600 rounded-xl text-sm outline-none focus:border-dark-600 focus:bg-dark-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link
              to="/settings"
              className="p-2 text-dark-400 hover:text-dark-100 hover:bg-white/5 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={18} />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
