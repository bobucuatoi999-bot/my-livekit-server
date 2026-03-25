import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Server,
  ShoppingCart,
  User,
  LogOut,
  Terminal,
  Wallet,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatVND } from '../lib/wallet'

const ACTIVE =
  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg bg-gray-800 text-white transition-colors duration-150'
const INACTIVE =
  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-150'

export default function Sidebar() {
  const navigate = useNavigate()
  const link = ({ isActive }: { isActive: boolean }) => (isActive ? ACTIVE : INACTIVE)

  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (data) setBalance(Number((data as any).balance ?? 0))
    }

    load()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className="w-[220px] min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col px-3 py-5 shrink-0">
      <div className="flex items-center gap-2 px-3 mb-8">
        <Terminal size={18} className="text-cyan-400" />
        <span className="text-base font-bold text-white tracking-tight">
          Hosting<span className="text-cyan-400">1s</span>
        </span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        <NavLink to="/dashboard" end className={link}>
          <LayoutDashboard size={16} />
          Tổng quan
        </NavLink>
        <NavLink to="/dashboard" className={link}>
          <Server size={16} />
          Máy chủ
        </NavLink>
        <NavLink to="/order" className={link}>
          <ShoppingCart size={16} />
          Đặt máy chủ
        </NavLink>
        <NavLink to="/wallet" className={link}>
          <Wallet size={16} />
          Ví & Số dư
        </NavLink>
        <NavLink to="/profile" className={link}>
          <User size={16} />
          Hồ sơ
        </NavLink>
        <div className="flex-1" />
        <div className="px-3 py-2 mb-1">
          <div className="text-xs text-gray-600">Số dư ví</div>
          <div className="text-sm font-medium text-cyan-400">
            {balance === null ? '...' : formatVND(balance)}
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-150 w-full text-left"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </nav>
    </aside>
  )
}

