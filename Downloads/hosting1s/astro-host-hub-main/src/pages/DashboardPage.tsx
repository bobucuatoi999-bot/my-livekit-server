import {
  Activity,
  ArrowRight,
  Bell,
  Clock,
  CreditCard,
  LogIn,
  Server,
  ShoppingCart,
  User,
  Wallet,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { formatVND } from '../lib/wallet'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type ServerRow = {
  id: string
  name: string
  ip_address: string
  tailscale_url: string | null
  status: 'online' | 'offline' | 'starting' | 'stopping' | 'restarting'
  ram_mb: number
  cpu_cores: number
  disk_gb: number
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  const [servers, setServers] = useState<ServerRow[]>([])
  const [serversLoading, setServersLoading] = useState(true)
  const [serversError, setServersError] = useState<string | null>(null)

  const onlineCount = useMemo(
    () => servers.filter((s) => s.status === 'online').length,
    [servers],
  )

  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [walletLoading, setWalletLoading] = useState(true)

  useEffect(() => {
    const loadServers = async () => {
      setServersLoading(true)
      setServersError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setServers([])
        setServersLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('servers')
        .select(
          'id,name,ip_address,tailscale_url,status,ram_mb,cpu_cores,disk_gb',
        )
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setServersError(error.message)
        setServers([])
        setServersLoading(false)
        return
      }

      setServers((data ?? []) as ServerRow[])
      setServersLoading(false)
    }

    loadServers()
  }, [])

  useEffect(() => {
    const loadWallet = async () => {
      setWalletLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setWalletBalance(null)
          return
        }

        // Use transactions as source of truth to avoid stale `wallets.balance`.
        const { data: txs } = await supabase
          .from('transactions')
          .select('balance_after,status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        const completedTxs = (txs ?? []).filter(
          (tx: any) => tx.status === 'completed' || tx.status == null,
        )
        const latestCompleted = completedTxs[0]

        if (latestCompleted?.balance_after != null) {
          setWalletBalance(Number(latestCompleted.balance_after ?? 0))
          return
        }

        // Fallback: if no transactions found, use wallets.balance.
        const { data } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        if (data) setWalletBalance(Number((data as any).balance ?? 0))
      } finally {
        setWalletLoading(false)
      }
    }

    loadWallet()
  }, [])

  const activityLog = [
    { id: 1, icon: 'login', text: 'Đăng nhập thành công', time: '2 phút trước', color: 'text-green-400' },
    { id: 2, icon: 'server', text: 'Khởi động lại VPS Ubuntu 24.04', time: '1 giờ trước', color: 'text-cyan-400' },
    { id: 3, icon: 'payment', text: 'Thanh toán đơn hàng thành công', time: '2 ngày trước', color: 'text-violet-400' },
    { id: 4, icon: 'server', text: 'Minecraft Server — Đã dừng', time: '3 ngày trước', color: 'text-amber-400' },
    { id: 5, icon: 'login', text: 'Đăng nhập từ thiết bị mới', time: '5 ngày trước', color: 'text-green-400' },
    { id: 6, icon: 'payment', text: 'Gia hạn dịch vụ tự động thành công', time: '7 ngày trước', color: 'text-violet-400' },
  ] as const

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-gray-950">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <header className="flex items-center justify-between px-8 py-4 border-b border-gray-800 bg-gray-900/50">
          <div className="text-white font-semibold text-lg">
            {greeting}, Khách hàng
          </div>

          <button type="button" className="bg-gray-800 p-2 rounded-lg relative">
            <Bell size={18} className="text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
          </button>
        </header>

        <main className="px-8 py-6">
          <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <Server size={20} className="text-cyan-400" />
                  <div className="text-2xl font-bold text-white">
                    {serversLoading ? '...' : servers.length}
                  </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-medium text-white">Máy chủ</div>
                <div className="text-xs text-gray-500 mt-0.5">Tổng số đang quản lý</div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <Activity size={20} className="text-green-400" />
                <div className="text-2xl font-bold text-white">{onlineCount}</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-medium text-white">Đang chạy</div>
                <div className="text-xs text-gray-500 mt-0.5">Máy chủ online</div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <Zap size={20} className="text-violet-400" />
                <div className="text-2xl font-bold text-white">1.2 TB</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-medium text-white">Băng thông</div>
                <div className="text-xs text-gray-500 mt-0.5">Tháng này</div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <Clock size={20} className="text-amber-400" />
                <div className="text-2xl font-bold text-white">99.9%</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-medium text-white">Uptime</div>
                <div className="text-xs text-gray-500 mt-0.5">30 ngày qua</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/wallet')}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-cyan-700 transition-colors text-left"
            >
              <div className="flex items-start justify-between">
                <Wallet size={20} className="text-cyan-400" />
                <div className="text-xl font-bold text-cyan-400">
                  {walletLoading ? '...' : formatVND(walletBalance ?? 0)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-medium text-white">Số dư ví</div>
                <div className="text-xs text-gray-500 mt-0.5">Nhấn để nạp thêm</div>
              </div>
            </button>
          </section>

          <section className="mb-8">
            <div className="text-lg font-semibold text-white mb-4">Máy chủ của bạn</div>
            {serversError ? (
              <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-sm text-red-300 mb-8">
                Không tải được danh sách máy chủ: {serversError}
              </div>
            ) : serversLoading ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-400 mb-8">
                Đang tải dữ liệu...
              </div>
            ) : servers.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-400 mb-8">
                empty
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                {servers.map((server) => {
                  const isOnline = server.status === 'online'

                  return (
                    <div
                      key={server.id}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-semibold text-white">{server.name}</div>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <div className="text-xs text-gray-500 font-mono">
                              {server.ip_address}
                            </div>

                            <Dialog>
                              <DialogTrigger asChild>
                                <button
                                  type="button"
                                  className="rounded-md border border-cyan-700/50 bg-cyan-900/10 px-2 py-1 text-xs font-medium text-cyan-300 transition-colors duration-150 hover:bg-cyan-900/20"
                                >
                                  Hướng dẫn kết nối (Tailscale)
                                </button>
                              </DialogTrigger>

                              <DialogContent className="border-gray-800 bg-gray-900 text-white">
                                <DialogHeader>
                                  <DialogTitle>Kết nối an toàn với Tailscale</DialogTitle>
                                  <DialogDescription className="text-gray-400">
                                    Làm theo từng bước để truy cập máy chủ bảo mật.
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 text-sm">
                                  <div className="rounded-lg border border-gray-800 bg-gray-950 p-3">
                                    <p className="font-semibold text-white">
                                      Bước 1: Tải ứng dụng.
                                    </p>
                                    <p className="mt-1 text-gray-400">
                                      Tải và cài đặt Tailscale trên máy tính hoặc điện thoại của bạn.
                                    </p>
                                    <a
                                      href="https://tailscale.com/download"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-2 inline-flex items-center justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-cyan-500"
                                    >
                                      Tải Tailscale
                                    </a>
                                  </div>

                                  <div className="rounded-lg border border-gray-800 bg-gray-950 p-3">
                                    <p className="font-semibold text-white">
                                      Bước 2: Tham gia mạng.
                                    </p>
                                    <p className="mt-1 text-gray-400">
                                      Nhấp vào liên kết chia sẻ máy chủ (Node Share) để đưa thiết bị của bạn vào cùng mạng lưới với máy chủ.
                                    </p>

                                    {server.tailscale_url ? (
                                      <a
                                        href={server.tailscale_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex items-center justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-cyan-500"
                                      >
                                        Mở Node Share
                                      </a>
                                    ) : (
                                      <p className="mt-2 text-xs text-gray-500">
                                        Chưa cấu hình liên kết Tailscale cho máy chủ này.
                                      </p>
                                    )}
                                  </div>

                                  <div className="rounded-lg border border-gray-800 bg-gray-950 p-3">
                                    <p className="font-semibold text-white">
                                      Bước 3: Kết nối Terminal.
                                    </p>
                                    <p className="mt-1 text-gray-400">
                                      Mở Command Prompt (Windows) hoặc Terminal (Mac/Linux) và gõ lệnh:
                                    </p>
                                    <pre className="mt-2 overflow-x-auto rounded-md border border-gray-800 bg-black/30 px-3 py-2 font-mono text-xs text-cyan-300">
                                      ssh root@{server.ip_address}
                                    </pre>
                                  </div>
                                </div>

                                <DialogFooter>
                                  <DialogClose asChild>
                                    <button
                                      type="button"
                                      className="w-full rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-gray-700 sm:w-auto"
                                    >
                                      Đã hiểu
                                    </button>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>

                          {server.tailscale_url ? (
                            <a
                              href={server.tailscale_url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 block truncate font-mono text-xs text-cyan-300 transition-colors duration-150 hover:text-cyan-200"
                            >
                              Tailscale URL: {server.tailscale_url}
                            </a>
                          ) : (
                            <p className="mt-2 text-xs text-gray-500">
                              Chưa có Tailscale URL.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {isOnline ? (
                          <span className="relative inline-flex items-center">
                            <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75 animate-ping" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                          </span>
                        ) : (
                          <span className="inline-flex h-2 w-2 rounded-full bg-red-400" />
                        )}
                        <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
                          {isOnline ? 'Đang chạy' : 'Đã dừng'}
                        </span>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        RAM:{' '}
                        {(server.ram_mb / 1024).toLocaleString('vi-VN', {
                          maximumFractionDigits: 0,
                        })}{' '}
                        GB · CPU: {server.cpu_cores} vCPU · Disk: {server.disk_gb} GB SSD
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/server/' + server.id)}
                        className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded-lg transition-colors duration-150"
                      >
                        Quản lý
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-lg font-semibold text-white mb-4">Hoạt động gần đây</div>

            <div>
              {activityLog.map((item) => {
                const iconSize = 16
                const iconClass = item.color
                const Icon =
                  item.icon === 'login' ? LogIn : item.icon === 'server' ? Server : CreditCard

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 border-b border-gray-800 last:border-0 py-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                      <Icon size={iconSize} className={iconClass} />
                    </div>

                    <div className="text-sm text-gray-300 flex-1">{item.text}</div>
                    <div className="text-xs text-gray-600 whitespace-nowrap">{item.time}</div>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <div className="text-lg font-semibold text-white mb-4">Truy cập nhanh</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => navigate('/wallet')}
                className="bg-gray-900 border border-cyan-800/40 hover:border-cyan-600 rounded-xl p-5 cursor-pointer transition-colors group text-left"
              >
                <Wallet size={24} className="text-cyan-400 mb-3" />
                <div className="text-sm font-semibold text-white">Nạp tiền vào ví</div>
                <div className="text-xs text-gray-500 mt-1">Chuyển khoản ngân hàng tức thì</div>
                <ArrowRight
                  size={14}
                  className="text-gray-600 group-hover:text-cyan-400 transition-colors mt-3"
                />
              </button>

              <button
                type="button"
                onClick={() => navigate('/order')}
                className="bg-gray-900 border border-violet-800/40 hover:border-violet-600 rounded-xl p-5 cursor-pointer transition-colors text-left"
              >
                <ShoppingCart size={24} className="text-violet-400 mb-3" />
                <div className="text-sm font-semibold text-white">Đặt máy chủ mới</div>
                <div className="text-xs text-gray-500 mt-1">Cấu hình theo nhu cầu thực tế</div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="bg-gray-900 border border-green-800/40 hover:border-green-600 rounded-xl p-5 cursor-pointer transition-colors text-left"
              >
                <User size={24} className="text-green-400 mb-3" />
                <div className="text-sm font-semibold text-white">Hồ sơ cá nhân</div>
                <div className="text-xs text-gray-500 mt-1">Cập nhật thông tin tài khoản</div>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

