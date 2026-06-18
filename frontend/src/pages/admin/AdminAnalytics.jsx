import { motion } from 'framer-motion'
import { TrendingUp, Users, FileText, BarChart3, Zap, Calendar } from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

// Sample analytics data — replace with real API data
const weeklyData = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  signups: Math.floor(Math.random() * 40 + 10),
  resumes: Math.floor(Math.random() * 60 + 20),
  ats: Math.floor(Math.random() * 30 + 5),
  coverLetters: Math.floor(Math.random() * 20 + 2),
}))

const planData = [
  { name: 'Free', value: 720, color: '#64748b' },
  { name: 'Pro', value: 180, color: '#6366f1' },
  { name: 'Premium', value: 40, color: '#f59e0b' },
]

const monthlyRevenue = Array.from({ length: 6 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
  revenue: Math.floor(Math.random() * 15000 + 5000),
}))

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <TrendingUp size={22} className="text-emerald-400" /> Analytics
        </h1>
        <p className="page-subtitle">Platform metrics and usage insights</p>
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Signups Today', value: '32', icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Resumes Today', value: '87', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'ATS Analyses',  value: '54', icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'AI Requests',   value: '203', icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card"
          >
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-dark-50">{value}</p>
            <p className="text-xs text-dark-400 font-medium">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* User Signups */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-100">User Signups (7 days)</h3>
            <Calendar size={15} className="text-dark-600" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="signGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Area type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={2} fill="url(#signGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Usage */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-dark-100 mb-4">Feature Usage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="resumes" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="ats" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="coverLetters" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 justify-center">
            {[
              { label: 'Resumes', color: '#6366f1' },
              { label: 'ATS', color: '#10b981' },
              { label: 'Cover Letters', color: '#f59e0b' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                <span className="text-xs text-dark-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Subscription Distribution */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-dark-100 mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={planData}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {planData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {planData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                <span className="text-xs text-dark-400">{p.name} ({p.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-semibold text-dark-100 mb-4">Revenue (₹)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
