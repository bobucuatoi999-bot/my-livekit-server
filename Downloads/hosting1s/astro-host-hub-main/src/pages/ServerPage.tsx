import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
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
import { supabase } from '@/lib/supabase'
import Sidebar from '../components/Sidebar'

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

export default function ServerPage() {
  const navigate = useNavigate()
  const params = useParams()

  const serverId = params.id || ''

  const [server, setServer] = useState<ServerRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadServer = async () => {
      setLoading(true)
      setError(null)

      if (!serverId) {
        setServer(null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('servers')
        .select('id,name,ip_address,tailscale_url,status,ram_mb,cpu_cores,disk_gb')
        .eq('id', serverId)
        .maybeSingle()

      if (error) {
        setError(error.message)
        setServer(null)
        setLoading(false)
        return
      }

      setServer((data ?? null) as ServerRow | null)
      setLoading(false)
    }

    loadServer()
  }, [serverId])

  const status = server?.status ?? 'offline'
  const isOnline = status === 'online'

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-gray-300 hover:text-white transition-colors duration-150"
            aria-label="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white truncate">
              {loading ? 'Đang tải máy chủ...' : server?.name ?? 'Không tìm thấy máy chủ'}
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-sm text-gray-400 mt-1">
              <span className="truncate">{server?.ip_address ?? ''}</span>

              {server && (
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
                        Thực hiện theo từng bước để truy cập máy chủ bảo mật.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 text-sm">
                      <div className="rounded-lg border border-gray-800 bg-gray-950 p-3">
                        <p className="font-semibold text-white">Bước 1: Tải ứng dụng.</p>
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
                        <p className="font-semibold text-white">Bước 2: Tham gia mạng.</p>
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
                        <p className="font-semibold text-white">Bước 3: Kết nối Terminal.</p>
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
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {error ? (
            <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
              Không tải được thông tin máy chủ: {error}
            </div>
          ) : !loading && !server ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-400">
              Không tìm thấy máy chủ.
            </div>
          ) : (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-base font-semibold text-white">Tailscale</h2>
              <p className="mt-2 text-sm text-gray-400">
                Liên kết chia sẻ máy chủ để đưa thiết bị của bạn vào cùng mạng lưới.
              </p>

              {server?.tailscale_url ? (
                <a
                  href={server.tailscale_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-cyan-500"
                >
                  Mở Node Share
                </a>
              ) : (
                <div className="mt-4 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-500">
                  Chưa cấu hình liên kết Tailscale cho máy chủ này.
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500 font-mono break-all">
                {server?.tailscale_url ? server.tailscale_url : ''}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

