import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Plus, Trash2, Zap, User } from 'lucide-react'
import { chatAPI } from '../services/api'
import toast from 'react-hot-toast'

const STARTERS = [
  'How can I improve my resume for a software engineer role?',
  'What are the most in-demand skills in 2024?',
  'How do I prepare for a technical interview?',
  'What salary should I negotiate for a developer role?',
]

export default function CareerAdvisor() {
  const [input, setInput] = useState('')
  const [chatId, setChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [chats, setChats] = useState([])
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { chatAPI.listChats().then(r => setChats(r.data)).catch(() => {}) }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadChat = async (id) => {
    try { const res = await chatAPI.getChat(id); setChatId(id); setMessages(res.data.messages || []) } catch {}
  }

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setSending(true)
    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: msg, created_at: new Date().toISOString() }])

    try {
      const res = await chatAPI.sendMessage({ content: msg, chat_id: chatId })
      if (!chatId) { setChatId(res.data.chat_id); chatAPI.listChats().then(r => setChats(r.data)).catch(() => {}) }
      setMessages(prev => [...prev.slice(0, -1), res.data.message, res.data.reply])
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'AI response failed. Add GEMINI_API_KEY to backend .env')
      setMessages(prev => prev.slice(0, -1))
    } finally { setSending(false) }
  }

  const newChat = () => { setChatId(null); setMessages([]) }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-5">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-3">
        <button onClick={newChat} className="w-full flex items-center gap-2 px-3 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus size={15} /> New Chat
        </button>
        <div className="glass-card flex-1 overflow-y-auto p-3 space-y-1">
          {chats.length > 0 ? chats.map(c => (
            <button key={c.id} onClick={() => loadChat(c.id)} className={`w-full text-left px-3 py-2 text-sm rounded-lg truncate ${chatId === c.id ? 'bg-brand-500/10 text-brand-300' : 'text-dark-400 hover:bg-dark-700/50'}`}>
              {c.title}
            </button>
          )) : <p className="text-xs text-dark-600 text-center py-4">No chats yet</p>}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-brand-600 flex items-center justify-center"><Zap size={18} className="text-white" /></div>
          <div><p className="font-semibold text-dark-100 text-sm">CareerForge AI Advisor</p><p className="text-xs text-emerald-400">● Online</p></div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-brand-600 flex items-center justify-center mx-auto mb-3"><Zap size={24} className="text-white" /></div>
                <h3 className="font-semibold text-dark-100 mb-1">Career AI Advisor</h3>
                <p className="text-dark-500 text-sm">Ask me anything about resumes, careers, or interviews</p>
              </div>
              <div className="grid gap-2 w-full max-w-md">
                {STARTERS.map(s => (
                  <button key={s} onClick={() => send(s)} className="px-4 py-2.5 text-sm text-dark-300 hover:text-dark-100 text-left bg-dark-700/50 hover:bg-dark-700 border border-dark-600 rounded-xl transition-all">{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-brand-600' : 'bg-gradient-to-br from-violet-600 to-brand-600'}`}>
                {msg.role === 'user' ? <User size={14} className="text-white" /> : <Zap size={14} className="text-white" />}
              </div>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-dark-700 text-dark-100 border border-dark-600 rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-brand-600 flex items-center justify-center"><Zap size={14} className="text-white" /></div>
              <div className="px-4 py-3 bg-dark-700 border border-dark-600 rounded-2xl rounded-tl-sm"><div className="flex gap-1.5"><span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce [animation-delay:0.15s]" /><span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce [animation-delay:0.3s]" /></div></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-3 border-t border-dark-700">
          <div className="flex items-end gap-2">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }}} placeholder="Ask about careers, resumes, interviews..." rows={1} className="flex-1 input resize-none py-2.5 text-sm" style={{ minHeight: 44 }} />
            <button onClick={() => send()} disabled={!input.trim() || sending} className="w-11 h-11 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors flex-shrink-0"><Send size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
