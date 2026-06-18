import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, usersAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await usersAPI.getMe()
      setUser(data)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('access_token',  data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    setUser(data.user)
    return data
  }

  const register = async (fullname, email, password) => {
    const { data } = await authAPI.register({ fullname, email, password })
    localStorage.setItem('access_token',  data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    toast.success('Logged out')
    window.location.href = '/'
  }

  const updateUser = (updated) => setUser((u) => ({ ...u, ...updated }))

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    reloadUser: loadUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
