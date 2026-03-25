import { useEffect, useMemo, useState } from 'react'
import { LogIn, Loader2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import useProfile from '../hooks/useProfile'
import { formatVND } from '../lib/wallet'

type Tab = 'profile' | 'history' | 'orders'

export default function ProfilePage() {
  const INPUT =
    'w-full bg-gray-950 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all'
  const BTN =
    'bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed'
  const OK =
    'mt-3 p-3 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400 text-sm'
  const ERR =
    'mt-3 p-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm'

  const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/

  const [tab, setTab] = useState<Tab>('profile')
  const [user, setUser] = useState<any>(null)

  const { profile, loading: profileLoading, error: profileError, refetch } = useProfile()

  // Card A - Thông tin tài khoản
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'taken' | 'available' | 'current'>('idle')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveResult, setSaveResult] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Card B - Đổi mật khẩu
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordResult, setPasswordResult] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Tab 2 - Lịch sử đăng nhập
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [loginHistory, setLoginHistory] = useState<any[]>([])

  // Tab 3 - Đơn hàng
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])

  const currentUsername = useMemo(() => profile?.username ?? '', [profile])

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.display_name ?? '')
    setUsername(profile.username ?? '')
  }, [profile])

  // Username availability check with debounce (600ms)
  useEffect(() => {
    const value = username.trim()

    // empty/short (<3): nothing
    if (!value || value.length < 3) {
      setUsernameStatus('idle')
      return
    }

    // equals current
    if (value === currentUsername) {
      setUsernameStatus('current')
      return
    }

    // Validate regex before saving (also avoid RPC calls for invalid values)
    if (!USERNAME_RE.test(value)) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')
    const t = window.setTimeout(async () => {
      try {
        const { data } = await supabase.rpc('is_username_taken', { p_username: value })
        setUsernameStatus(data ? 'taken' : 'available')
      } catch {
        setUsernameStatus('idle')
      }
    }, 600)

    return () => window.clearTimeout(t)
  }, [username, currentUsername])

  const handleSaveProfile = async () => {
    if (!user) return

    const nextUsername = username.trim()
    const nextDisplayName = displayName

    if (!USERNAME_RE.test(nextUsername)) {
      setSaveResult({
        type: 'err',
        text: 'Username không hợp lệ. Chỉ cho phép chữ cái, số và dấu gạch dưới (3-30 ký tự).',
      })
      return
    }

    if (usernameStatus === 'taken') {
      setSaveResult({ type: 'err', text: 'Username này đã được sử dụng.' })
      return
    }

    const changed =
      nextUsername !== (profile?.username ?? '') || nextDisplayName !== (profile?.display_name ?? '')

    if (!changed) return

    setSaveLoading(true)
    setSaveResult(null)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: nextUsername, display_name: nextDisplayName })
        .eq('id', user.id)

      if (error) {
        setSaveResult({ type: 'err', text: error.message })
      } else {
        setSaveResult({ type: 'ok', text: 'Đã lưu thay đổi thành công.' })
        refetch()
      }
    } catch {
      setSaveResult({ type: 'err', text: 'Đã xảy ra lỗi không mong muốn.' })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordResult({ type: 'err', text: 'Vui lòng điền đầy đủ thông tin.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordResult({ type: 'err', text: 'Mật khẩu phải có ít nhất 6 ký tự.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordResult({ type: 'err', text: 'Mật khẩu xác nhận không khớp.' })
      return
    }

    setPasswordLoading(true)
    setPasswordResult(null)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) setPasswordResult({ type: 'err', text: error.message })
      else {
        setPasswordResult({ type: 'ok', text: 'Mật khẩu đã được cập nhật thành công.' })
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setPasswordResult({ type: 'err', text: 'Đã xảy ra lỗi không mong muốn.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(50)

      if (error) setHistoryError(error.message)
      else setLoginHistory(data ?? [])
    } catch {
      setHistoryError('Không thể tải lịch sử đăng nhập.')
    } finally {
      setHistoryLoading(false)
    }
  }

  const loadOrders = async () => {
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) setOrdersError(error.message)
      else setOrders(data ?? [])
    } catch {
      setOrdersError('Không thể tải đơn hàng.')
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'history') loadHistory()
    if (tab === 'orders') loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const canSave = useMemo(() => {
    const changed =
      username.trim() !== (profile?.username ?? '') || displayName !== (profile?.display_name ?? '')
    const valid = USERNAME_RE.test(username.trim())
    return changed && valid && usernameStatus !== 'taken' && !saveLoading
  }, [username, displayName, profile, usernameStatus, saveLoading])

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-gray-950">
      <Sidebar />

      <div className="flex-1 overflow-y-auto bg-gray-950 px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">
            Hồ sơ
          </h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={
              tab === 'profile'
                ? 'bg-cyan-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium'
                : 'bg-gray-800 text-gray-400 hover:text-white px-4 py-1.5 rounded-lg text-sm'
            }
          >
            Hồ sơ cá nhân
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={
              tab === 'history'
                ? 'bg-cyan-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium'
                : 'bg-gray-800 text-gray-400 hover:text-white px-4 py-1.5 rounded-lg text-sm'
            }
          >
            Lịch sử đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setTab('orders')}
            className={
              tab === 'orders'
                ? 'bg-cyan-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium'
                : 'bg-gray-800 text-gray-400 hover:text-white px-4 py-1.5 rounded-lg text-sm'
            }
          >
            Đơn hàng
          </button>
        </div>

        {/* TAB 1 */}
        {tab === 'profile' && (
          <div>
            {profileLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 className="animate-spin" />
              </div>
            ) : profileError ? (
              <div className={ERR}>{profileError}</div>
            ) : (
              <>
                {/* CARD A */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-5">
                  <div className="text-lg font-semibold text-white mb-4">Thông tin tài khoản</div>

                  <div className="space-y-5">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Email</div>
                      <div className="text-white text-sm font-mono">{user?.email}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Tên hiển thị</div>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={INPUT}
                      />
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Tên người dùng</div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={INPUT}
                      />

                      {/* Availability indicator */}
                      <div className="mt-1 text-xs">
                        {username.trim().length < 3 ? null : username.trim() === currentUsername ? (
                          <div className="text-gray-500">Đây là username hiện tại của bạn</div>
                        ) : usernameStatus === 'checking' ? (
                          <div className="text-gray-500">Đang kiểm tra...</div>
                        ) : usernameStatus === 'taken' ? (
                          <div className="text-red-400">Username này đã được sử dụng</div>
                        ) : usernameStatus === 'available' ? (
                          <div className="text-green-400">Username có thể sử dụng</div>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Ngày tham gia</div>
                      <div className="text-white text-sm">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : ''}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={!canSave}
                    className={BTN}
                  >
                    {saveLoading && <Loader2 size={16} className="animate-spin" />}
                    Lưu thay đổi
                  </button>

                  {saveResult && (
                    <div className={saveResult.type === 'ok' ? OK : ERR}>{saveResult.text}</div>
                  )}
                </div>

                {/* CARD B */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="text-lg font-semibold text-white mb-4">Đổi mật khẩu</div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Mật khẩu mới</div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Xác nhận mật khẩu mới</div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                  </div>

                  {passwordResult && (
                    <div className={passwordResult.type === 'ok' ? OK : ERR}>{passwordResult.text}</div>
                  )}

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className={BTN}
                  >
                    {passwordLoading && <Loader2 size={16} className="animate-spin" />}
                    Cập nhật mật khẩu
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2 */}
        {tab === 'history' && (
          <div>
            {historyLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 className="animate-spin" />
              </div>
            ) : historyError ? (
              <div className={ERR}>{historyError}</div>
            ) : loginHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-12">Chưa có lịch sử đăng nhập.</div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {loginHistory.map((row: any) => {
                  const success = row.status === 'success'
                  const statusText = success ? 'Đăng nhập thành công' : 'Đăng nhập thất bại'
                  const ua = (row.user_agent ?? '').toString()
                  const uaTrunc = ua.length > 60 ? ua.slice(0, 60) + '...' : ua
                  return (
                    <div
                      key={row.id}
                      className="flex items-center gap-4 px-5 py-4 border-b border-gray-800 last:border-0"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          success ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                        }`}
                      >
                        <LogIn size={16} />
                      </div>

                      <div className="flex-1">
                        <div className="text-sm text-white">{statusText}</div>
                        <div className="text-xs text-gray-500 mt-0.5 font-mono">{uaTrunc}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {row.logged_at ? new Date(row.logged_at).toLocaleDateString('vi-VN') : ''}
                        </div>
                        <div className="text-xs text-gray-600">
                          {row.logged_at
                            ? new Date(row.logged_at).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3 */}
        {tab === 'orders' && (
          <div>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 className="animate-spin" />
              </div>
            ) : ordersError ? (
              <div className={ERR}>{ordersError}</div>
            ) : orders.length === 0 ? (
              <div className="text-center text-gray-500 py-12">Bạn chưa có đơn hàng nào.</div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {orders.map((row: any) => {
                  const status = row.status as string
                  const badge = (() => {
                    switch (status) {
                      case 'pending':
                        return { cls: 'bg-amber-900/40 text-amber-400', text: 'Chờ xác nhận' }
                      case 'confirmed':
                        return { cls: 'bg-blue-900/40 text-blue-400', text: 'Đã xác nhận' }
                      case 'active':
                        return { cls: 'bg-green-900/40 text-green-400', text: 'Đang hoạt động' }
                      case 'cancelled':
                        return { cls: 'bg-red-900/40 text-red-400', text: 'Đã hủy' }
                      case 'expired':
                        return { cls: 'bg-gray-800 text-gray-500', text: 'Hết hạn' }
                      default:
                        return { cls: 'bg-gray-800 text-gray-500', text: 'Hết hạn' }
                    }
                  })()

                  const billingMonths = Number(row.billing_months ?? 0)
                  const period =
                    billingMonths === 1 ? '/tháng' : billingMonths === 3 ? '/quý' : '/năm'

                  return (
                    <div
                      key={row.id}
                      className="px-5 py-4 border-b border-gray-800 last:border-0"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-semibold text-white">{row.server_name}</div>
                        <span className={`text-xs px-3 py-1 rounded-lg ${badge.cls}`}>{badge.text}</span>
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        {row.cpu_label} · {row.ram_label} {row.ddr_label} · {row.storage_label} {row.storage_type_label}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-4">
                        <div className="text-xs text-gray-600">
                          {row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : ''}
                        </div>
                        <div className="text-sm font-semibold text-cyan-400">
                          {formatVND(Number(row.total_price ?? 0)) + period}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

