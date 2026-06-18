import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usersAPI, subscriptionAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    fullname: user?.fullname || '',
    target_role: user?.target_role || '',
    linkedin_url: user?.linkedin_url || '',
    github_url: user?.github_url || '',
  })
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '' })

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await usersAPI.updateMe(form)
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err?.response?.data?.detail || 'Update failed') }
    finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (!passForm.current_password || !passForm.new_password) { toast.error('Fill both fields'); return }
    if (passForm.new_password.length < 8) { toast.error('Min 8 characters'); return }
    try {
      await usersAPI.changePassword(passForm)
      toast.success('Password changed!')
      setPassForm({ current_password: '', new_password: '' })
    } catch (err) { toast.error(err?.response?.data?.detail || 'Failed') }
  }

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'security', label: '🔒 Security' },
    { id: 'subscription', label: '💳 Subscription' },
  ]

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-dark-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] pb-0">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
              tab === id ? 'border-brand-500 text-brand-400' : 'border-transparent text-dark-400 hover:text-dark-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass-card p-6">
        {tab === 'profile' && (
          <div className="space-y-5">
            <h3 className="text-white font-semibold">Profile Information</h3>
            {/* Avatar */}
            <div className="flex items-center gap-4">
              {user?.profile_photo ? (
                <img src={user.profile_photo} className="w-16 h-16 rounded-2xl object-cover" alt="" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold">
                  {user?.fullname?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white font-medium">{user?.fullname}</p>
                <p className="text-dark-500 text-xs">{user?.email}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={form.fullname} onChange={e => setForm(p => ({ ...p, fullname: e.target.value }))} />
              </div>
              <div>
                <label className="label">Target Role</label>
                <input className="input" placeholder="e.g. Software Engineer" value={form.target_role} onChange={e => setForm(p => ({ ...p, target_role: e.target.value }))} />
              </div>
              <div>
                <label className="label">LinkedIn URL</label>
                <input className="input" placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))} />
              </div>
              <div>
                <label className="label">GitHub URL</label>
                <input className="input" placeholder="https://github.com/..." value={form.github_url} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))} />
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        )}

        {tab === 'security' && (
          <div className="space-y-5">
            <h3 className="text-white font-semibold">Change Password</h3>
            <div className="max-w-sm space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input type="password" className="input" value={passForm.current_password} onChange={e => setPassForm(p => ({ ...p, current_password: e.target.value }))} />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" className="input" placeholder="Min 8 characters" value={passForm.new_password} onChange={e => setPassForm(p => ({ ...p, new_password: e.target.value }))} />
              </div>
              <button onClick={changePassword} className="btn-primary">Update Password</button>
            </div>
          </div>
        )}

        {tab === 'subscription' && (
          <div className="space-y-5">
            <h3 className="text-white font-semibold">Subscription</h3>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold capitalize">Free Plan</span>
                <span className="badge-success">Active</span>
              </div>
              <ul className="space-y-2 text-sm text-dark-400">
                <li>✓ 3 ATS Analyses</li>
                <li>✓ 3 Cover Letters</li>
                <li>✓ 10 AI Credits</li>
                <li>✓ Resume Builder</li>
                <li>✓ Portfolio Generator</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-brand-500/20 bg-brand-500/5">
              <p className="text-brand-300 font-medium text-sm mb-2">Upgrade to Pro — ₹99/month</p>
              <p className="text-dark-500 text-xs mb-3">Unlimited ATS analyses, cover letters, premium templates, and more.</p>
              <Link to="/pricing" className="btn-primary text-xs py-2 px-4">View Plans</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
