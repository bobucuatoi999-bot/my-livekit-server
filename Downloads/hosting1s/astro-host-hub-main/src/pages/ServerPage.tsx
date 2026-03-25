import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Play, Square, RotateCcw } from 'lucide-react'
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { mockServers } from '../data/mockServers'
import Sidebar from '../components/Sidebar'

export default function ServerPage() {
  const navigate = useNavigate()
  const params = useParams()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  const serverId = params.id || ''
  const server = useMemo(() => mockServers.find((s) => s.id === serverId) || null, [serverId])

  useEffect(() => {
    if (!containerRef.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"JetBrains Mono","Fira Code",monospace',
      theme: {
        background: '#030712',
        foreground: '#e5e7eb',
        cursor: '#06b6d4',
        selectionBackground: '#1e40af55',
      },
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    term.open(containerRef.current)
    fitAddon.fit()

    const bootLines = [
      '\r\n\x1b[36m╔══════════════════════════════════════╗\x1b[0m\r\n',
      '\x1b[36m║      HOSTING1S CONTROL PANEL         ║\x1b[0m\r\n',
      '\x1b[36m╚══════════════════════════════════════╝\x1b[0m\r\n\r\n',
      '\x1b[33mKết nối đến máy chủ...\x1b[0m\r\n',
      '\x1b[32m✓ Xác thực thành công\x1b[0m\r\n',
      '\x1b[32m✓ Phiên bảo mật đã thiết lập\x1b[0m\r\n\r\n',
      '\x1b[1;37mroot@hosting1s\x1b[0m:\x1b[34m~\x1b[0m# ',
    ]

    termRef.current = term
    fitAddonRef.current = fitAddon

    let cancelled = false
    const runBoot = async () => {
      for (const line of bootLines) {
        if (cancelled) return
        term.write(line)
        await new Promise((r) => setTimeout(r, 60))
      }
    }
    runBoot()

    const onResize = () => {
      fitAddon.fit()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      term.dispose()
    }
  }, [])

  const status = server?.status ?? 'offline'

  const writeLine = (message: string) => {
    termRef.current?.write('\r\n' + message + '\r\n')
  }

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <button type="button" onClick={() => navigate(-1)} className="text-gray-300 hover:text-white">
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1">
          <div className="font-semibold text-white">
            {server?.name ?? 'Không tìm thấy máy chủ'}
          </div>
          <div className="font-mono text-sm text-gray-400">{server?.ip ?? ''}</div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'online' ? (
            <span className="relative inline-flex items-center">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
          ) : (
            <span className="inline-flex h-2 w-2 rounded-full bg-red-400" />
          )}
          <span className={status === 'online' ? 'text-green-400' : 'text-red-400'}>
            {status === 'online' ? 'Đang chạy' : 'Đã dừng'}
          </span>
        </div>
      </header>

        <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-2 flex gap-2 shrink-0">
        <button
          type="button"
          className="bg-gray-800 hover:bg-gray-700 text-sm px-3 py-1.5 rounded-lg flex items-center gap-2"
          onClick={() => writeLine('Đang khởi động máy chủ...')}
        >
          <Play size={16} />
          Khởi động
        </button>

        <button
          type="button"
          className="bg-gray-800 hover:bg-gray-700 text-sm px-3 py-1.5 rounded-lg flex items-center gap-2"
          onClick={() => writeLine('Đang dừng máy chủ...')}
        >
          <Square size={16} />
          Dừng
        </button>

        <button
          type="button"
          className="bg-gray-800 hover:bg-gray-700 text-sm px-3 py-1.5 rounded-lg flex items-center gap-2"
          onClick={() => writeLine('Đang khởi động lại máy chủ...')}
        >
          <RotateCcw size={16} />
          Khởi động lại
        </button>
        </div>

        <div className="flex-1 min-h-0">
          <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  )
}

