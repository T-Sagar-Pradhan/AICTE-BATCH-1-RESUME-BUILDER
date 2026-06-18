import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users, FileText, BarChart3, Briefcase, Globe,
  Brain, TrendingUp, Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { dashboardAPI, usersAPI } from '../../services/api'
import PageLoader from '../../components/ui/PageLoader'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item    = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function AdminDashboard() {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => dashboardAPI.getAdminOverview().then(r => r.data),
  })

  const { data: userStats, isLoading: loadingUsers } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => usersAPI.getUserStats().then(r => r.data),
    retry: false,
  })

  const { data: users = [], isLoading: loadingUserList } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersAPI.listUsers().then(r => r.data),
    retry: false,
  })

  if (loadingOverview) return <PageLoader />

  const stats = overview?.overview || {}

  const metricCards = [
    { label: 'Total Users',          value: stats.total_users || 0,         icon: Users,     color: 'text-brand-400',   bg: 'bg-brand-500/10' },
    { label: 'New This Week',         value: stats.new_users_week || 0,      icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Resumes Created',       value: stats.total_resumes || 0,       icon: FileText,  color: 'text-violet-400',  bg: 'bg-violet-500/10' },
    { label: 'ATS Analyses',          value: stats.total_ats_analyses || 0,  icon: BarChart3, color: 'text-amber-400',   bg: 'bg-amber-500/10' },
    { label: 'Cover Letters',         value: stats.total_cover_letters || 0, icon: Briefcase, color: 'text-pink-400',    bg: 'bg-pink-500/10' },
    { label: 'Portfolios',            value: stats.total_portfolios || 0,    icon: Globe,     color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
    { label: 'Interview Sessions',    value: stats.total_interview_sessions || 0, icon: Brain, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'AI Requests',           value: stats.total_ai_requests || 0,   icon: Activity,  color: 'text-red-400',     bg: 'bg-red-500/10' },
  ]

  // Mock chart data for demo purposes (replace with real analytics endpoint)
  const growthData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
    users: Math.floor(Math.random() * 50 + 10),
    analyses: Math.floor(Math.random() * 30 + 5),
  }))

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Activity size={22} className="text-brand-400" /> Admin Dashboard
        </h1>
        <p className="page-subtitle">Platform-wide analytics and user management</p>
      </div>

      {/* Metric cards */}
      <motion.div
        variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {metricCards.map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div key={label} variants={item} className="stat-card">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-dark-50">{value.toLocaleString()}</p>
            <p className="text-xs font-medium text-dark-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h3 className="font-semibold text-dark-100 mb-4">User Growth (7 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#userGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold text-dark-100 mb-4">Daily ATS Analyses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              />
              <Bar dataKey="analyses" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Users */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-dark-100 mb-4">Recent Users</h3>
        {loadingUserList ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10).map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        {u.profile_photo ? (
                          <img src={u.profile_photo} className="w-7 h-7 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                            {u.fullname?.[0]}
                          </div>
                        )}
                        <span>{u.fullname}</span>
                      </div>
                    </td>
                    <td className="text-dark-400">{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-info'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-dark-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
