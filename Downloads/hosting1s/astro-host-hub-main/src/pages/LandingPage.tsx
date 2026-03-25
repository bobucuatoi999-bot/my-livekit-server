import { useNavigate } from 'react-router-dom'
import { Terminal, Zap, Shield, Clock } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="flex items-center gap-3 mb-6">
        <Terminal className="text-cyan-400" size={36} />
        <span className="text-4xl font-bold text-white tracking-tight">
          Hosting<span className="text-cyan-400">1s</span>
        </span>
      </div>
      <p className="text-gray-400 text-lg mb-2">Dịch vụ máy chủ tốc độ cao</p>
      <p className="text-gray-600 text-sm mb-10">Kích hoạt trong 15 phút · Uptime 99.9% · Hỗ trợ 24/7</p>
      <div className="flex gap-3 mb-16">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Bắt đầu ngay
        </button>
        <button
          type="button"
          onClick={() => navigate('/order')}
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Xem cấu hình
        </button>
      </div>
      <div className="flex gap-10 text-gray-600 text-xs">
        <span className="flex items-center gap-1.5">
          <Zap size={12} className="text-cyan-500" />
          Tốc độ cao
        </span>
        <span className="flex items-center gap-1.5">
          <Shield size={12} className="text-cyan-500" />
          Bảo mật SSL
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} className="text-cyan-500" />
          Kích hoạt nhanh
        </span>
      </div>
    </div>
  )
}
