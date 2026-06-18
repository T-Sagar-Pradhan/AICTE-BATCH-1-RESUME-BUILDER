import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, PublicRoute, AdminRoute } from './routes/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import Home         from './pages/Home'
import Login           from './pages/auth/Login'
import Register        from './pages/auth/Register'
import ForgotPassword  from './pages/auth/ForgotPassword'
import ResetPassword   from './pages/auth/ResetPassword'
import Dashboard    from './pages/Dashboard'
import ResumeBuilder    from './pages/ResumeBuilder'
import ATSAnalyzer      from './pages/ATSAnalyzer'
import CoverLetter      from './pages/CoverLetter'
import Portfolio        from './pages/Portfolio'
import InterviewPrep    from './pages/InterviewPrep'
import CareerAdvisor    from './pages/CareerAdvisor'
import Pricing          from './pages/Pricing'
import Settings         from './pages/Settings'
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminAnalytics   from './pages/admin/AdminAnalytics'

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Auth */}
      <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password"  element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* Protected — with Dashboard Layout */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout><Dashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/resume-builder" element={
        <ProtectedRoute>
          <DashboardLayout><ResumeBuilder /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/ats-analyzer" element={
        <ProtectedRoute>
          <DashboardLayout><ATSAnalyzer /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/cover-letter" element={
        <ProtectedRoute>
          <DashboardLayout><CoverLetter /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/portfolio" element={
        <ProtectedRoute>
          <DashboardLayout><Portfolio /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/interview-prep" element={
        <ProtectedRoute>
          <DashboardLayout><InterviewPrep /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/career-advisor" element={
        <ProtectedRoute>
          <DashboardLayout><CareerAdvisor /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout><Settings /></DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <AdminRoute>
          <DashboardLayout><AdminDashboard /></DashboardLayout>
        </AdminRoute>
      } />
      <Route path="/admin/analytics" element={
        <AdminRoute>
          <DashboardLayout><AdminAnalytics /></DashboardLayout>
        </AdminRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-8xl font-black text-dark-700 mb-4">404</p>
            <p className="text-dark-400 mb-6">Page not found</p>
            <a href="/" className="btn-primary inline-flex">Go Home</a>
          </div>
        </div>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
