import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Terminal, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ParticleBackground from '../components/ParticleBackground'
import Navbar from '../components/Navbar'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const translateAuthError = (message: string) => {
    const m = message || ''
    if (m.includes('Invalid login credentials')) return 'Email hoặc mật khẩu không đúng.'
    if (m.includes('Email not confirmed')) return 'Vui lòng xác nhận email trước khi đăng nhập.'
    if (m.includes('already registered')) return 'Email này đã được đăng ký. Vui lòng đăng nhập.'
    return m
  }

  const handleAuth = async () => {
    setError(null)
    setSuccess(null)

    const e = email.trim()
    const p = password

    // Validation before calling Supabase.
    if (!e || !p) {
      setError('Vui lòng điền email và mật khẩu.')
      return
    }
    if (p.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (tab === 'register' && p !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setLoading(true)
    try {
      if (tab === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: e,
          password: p,
        })

        if (authError) {
          setError(translateAuthError(authError.message))
          return
        }

        // Insert login_history row (swallow errors silently).
        try {
          await supabase.from('login_history').insert({
            user_id: data.user.id,
            user_agent: navigator.userAgent.substring(0, 200),
            status: 'success',
          })
        } catch {}

        navigate('/dashboard')
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email: e,
          password: p,
        })

        if (authError) {
          setError(translateAuthError(authError.message))
          return
        }

        setSuccess('Kiểm tra email của bạn để xác nhận tài khoản.')
      }
    } catch {
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter' && !loading) handleAuth()
  }

  const title = useMemo(() => (tab === 'login' ? 'Đăng nhập' : 'Đăng ký'), [tab])

  return (
    <div className="min-h-screen bg-gray-950 relative">
      <ParticleBackground />
      <Navbar />

      <div className="relative z-10 w-full flex items-center justify-center px-4 pt-24 pb-10">
        <div className="w-full max-w-md bg-[rgba(10,15,30,0.75)] backdrop-blur-[24px] border border-[rgba(255,255,255,0.07)] rounded-[1.25rem] shadow-[0_0_60px_rgba(14,77,143,0.15),0_25px_50px_rgba(0,0,0,0.6)] p-7">
          {/* Brand header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Terminal className="text-cyan-400" size={28} />
              <span className="text-xl font-bold text-white tracking-tight">
                Hosting<span className="text-cyan-400">1s</span>
              </span>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-5">Bảng điều khiển dịch vụ lưu trữ</p>

          {/* Tabs */}
          <div className="flex bg-[rgba(0,0,0,0.3)] rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); setSuccess(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === 'login' ? 'bg-[rgba(255,255,255,0.08)] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); setSuccess(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === 'register' ? 'bg-[rgba(255,255,255,0.08)] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Email của bạn"
                autoComplete="email"
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mật khẩu"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-4 p-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400 text-sm">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleAuth}
            disabled={loading}
            className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              title
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
