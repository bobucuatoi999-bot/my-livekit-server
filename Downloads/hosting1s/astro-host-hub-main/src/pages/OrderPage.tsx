import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Tag,
  CalendarDays,
  Clock,
  CheckCircle,
  CheckCircle2,
  Cpu,
  Database,
  HardDrive,
  Monitor,
  Shield,
  ShoppingCart,
  Wifi,
  Zap,
  Wallet,
  Loader2,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { formatVND } from '../lib/wallet'

export default function OrderPage() {
  const navigate = useNavigate()

  const [user, setUser] = useState<any>(null)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bank'>('wallet')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setWalletBalance(Number((data as any).balance ?? 0))
      })
  }, [user])

  const CPU_OPTIONS = [
    { id: 'i7-1c', label: 'Intel Core i7 — 1 vCPU', cores: 1, price: 99000 },
    { id: 'i7-2c', label: 'Intel Core i7 — 2 vCPU', cores: 2, price: 185000 },
    { id: 'i7-4c', label: 'Intel Core i7 — 4 vCPU', cores: 4, price: 349000 },
    { id: 'i7-8c', label: 'Intel Core i7 — 8 vCPU', cores: 8, price: 649000 },
  ]
  const RAM_OPTIONS = [
    { id: 'ram-2', label: '2 GB', gb: 2, price: 39000 },
    { id: 'ram-4', label: '4 GB', gb: 4, price: 72000 },
    { id: 'ram-8', label: '8 GB', gb: 8, price: 135000 },
    { id: 'ram-16', label: '16 GB', gb: 16, price: 259000 },
    { id: 'ram-32', label: '32 GB', gb: 32, price: 489000 },
  ]
  const DDR_OPTIONS = [
    { id: 'ddr4', label: 'DDR4', price: 0 },
    { id: 'ddr5', label: 'DDR5', price: 49000 },
  ]
  const STORAGE_OPTIONS = [
    { id: 'st-20', label: '20 GB', gb: 20, price: 19000 },
    { id: 'st-40', label: '40 GB', gb: 40, price: 35000 },
    { id: 'st-80', label: '80 GB', gb: 80, price: 65000 },
    { id: 'st-160', label: '160 GB', gb: 160, price: 119000 },
    { id: 'st-320', label: '320 GB', gb: 320, price: 219000 },
  ]
  const STORAGE_TYPE_OPTIONS = [
    { id: 'hdd', label: 'HDD', desc: 'Tiết kiệm, phù hợp lưu trữ', price: 0 },
    { id: 'ssd', label: 'SSD', desc: 'Nhanh hơn 10x, phù hợp web/app', price: 79000 },
    { id: 'nvme', label: 'NVMe SSD', desc: 'Nhanh nhất, độ trễ cực thấp', price: 149000 },
  ]
  const OS_OPTIONS = [
    { id: 'ubuntu-24', label: 'Ubuntu 24.04 LTS', price: 0 },
    { id: 'ubuntu-22', label: 'Ubuntu 22.04 LTS', price: 0 },
    { id: 'debian-12', label: 'Debian 12', price: 0 },
    { id: 'centos-9', label: 'CentOS Stream 9', price: 0 },
    { id: 'windows-22', label: 'Windows Server 2022', price: 229000 },
  ]
  const BANDWIDTH_OPTIONS = [
    { id: 'bw-100', label: '100 Mbps', price: 0 },
    { id: 'bw-500', label: '500 Mbps', price: 49000 },
    { id: 'bw-1000', label: '1 Gbps', price: 99000 },
  ]
  const BILLING_OPTIONS = [
    { id: 'monthly', label: 'Hàng tháng', months: 1, discount: 0 },
    { id: 'quarterly', label: 'Hàng quý', months: 3, discount: 0.07 },
    { id: 'yearly', label: 'Hàng năm', months: 12, discount: 0.18 },
  ]

  const initialState = useMemo(
    () => ({
      cpu: CPU_OPTIONS[1],
      ram: RAM_OPTIONS[1],
      ddr: DDR_OPTIONS[0],
      storage: STORAGE_OPTIONS[1],
      storageType: STORAGE_TYPE_OPTIONS[1],
      os: OS_OPTIONS[0],
      bandwidth: BANDWIDTH_OPTIONS[0],
      billing: BILLING_OPTIONS[0],
      serverName: 'VPS-',
      contactPhone: '',
    }),
    [],
  )

  const [cpu, setCpu] = useState(initialState.cpu)
  const [ram, setRam] = useState(initialState.ram)
  const [ddr, setDdr] = useState(initialState.ddr)
  const [storage, setStorage] = useState(initialState.storage)
  const [storageType, setStorageType] = useState(initialState.storageType)
  const [os, setOs] = useState(initialState.os)
  const [bandwidth, setBandwidth] = useState(initialState.bandwidth)
  const [billing, setBilling] = useState(initialState.billing)

  const [serverName, setServerName] = useState(initialState.serverName)
  const [contactPhone, setContactPhone] = useState(initialState.contactPhone)

  const [orderPlaced, setOrderPlaced] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [balanceDeducted, setBalanceDeducted] = useState(false)

  const nameValid = /^[a-zA-Z0-9\-]+$/.test(serverName) && serverName.trim().length >= 2 && serverName.trim().length <= 40

  // DERIVED PRICES (not state)
  const baseMonthly = cpu.price + ram.price + ddr.price + storage.price + storageType.price + os.price + bandwidth.price
  const discountedMonthly = Math.round(baseMonthly * (1 - billing.discount))
  const totalPrice = discountedMonthly * billing.months

  const periodLabel = billing.months === 1 ? '/tháng' : billing.months === 3 ? '/quý' : '/năm'
  const saved = Math.max(0, baseMonthly * billing.months - totalPrice)

  const resetState = () => {
    setOrderPlaced(false)
    setOrdering(false)
    setOrderError(null)
    setBalanceDeducted(false)

    setCpu(initialState.cpu)
    setRam(initialState.ram)
    setDdr(initialState.ddr)
    setStorage(initialState.storage)
    setStorageType(initialState.storageType)
    setOs(initialState.os)
    setBandwidth(initialState.bandwidth)
    setBilling(initialState.billing)
    setServerName(initialState.serverName)
    setContactPhone(initialState.contactPhone)
  }

  const handleOrder = async () => {
    // 1. Validate name + phone
    const nextName = serverName.trim()
    if (!/^[a-zA-Z0-9\-]+$/.test(nextName) || nextName.length < 2 || nextName.length > 40) {
      setOrderError('Tên máy chủ không hợp lệ.')
      return
    }
    if (!contactPhone.trim()) {
      setOrderError('Vui lòng nhập số điện thoại liên hệ.')
      return
    }

    setOrderError(null)
    setOrdering(true)
    setBalanceDeducted(false)

    try {
      // 3. Get user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')

      // 4. Insert into public.orders
      const { error: insertError } = await supabase.from('orders').insert({
        user_id: user.id,
        server_name: nextName,
        contact_phone: contactPhone.trim(),

        cpu_id: cpu.id,
        cpu_label: cpu.label,
        cpu_cores: cpu.cores,
        cpu_price: cpu.price,

        ram_id: ram.id,
        ram_label: ram.label,
        ram_gb: ram.gb,
        ram_price: ram.price,

        ddr_id: ddr.id,
        ddr_label: ddr.label,
        ddr_price: ddr.price,

        storage_id: storage.id,
        storage_label: storage.label,
        storage_gb: storage.gb,
        storage_price: storage.price,

        storage_type_id: storageType.id,
        storage_type_label: storageType.label,
        storage_type_price: storageType.price,

        os_id: os.id,
        os_label: os.label,
        os_price: os.price,

        bandwidth_id: bandwidth.id,
        bandwidth_label: bandwidth.label,
        bandwidth_price: bandwidth.price,

        billing_id: billing.id,
        billing_label: billing.label,
        billing_months: billing.months,
        billing_discount: billing.discount,

        base_monthly: baseMonthly,
        discounted_monthly: discountedMonthly,
        total_price: totalPrice,
        status: 'pending',
      })

      if (insertError) {
        setOrderError(insertError.message)
        return
      }

      // 5. Xử lý thanh toán theo phương thức
      if (paymentMethod === 'wallet') {
        try {
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('id, balance, total_spent')
            .eq('user_id', user.id)
            .single()

          if (walletData && !walletError) {
            const walletBalance = Number((walletData as any).balance ?? 0)
            const walletTotalSpent = Number((walletData as any).total_spent ?? 0)

            if (walletBalance >= totalPrice) {
              const newBalance = walletBalance - totalPrice
              const newTotalSpent = walletTotalSpent + totalPrice

              await supabase
                .from('wallets')
                .update({
                  balance: newBalance,
                  total_spent: newTotalSpent,
                })
                .eq('id', (walletData as any).id)

              await supabase.from('transactions').insert({
                user_id: user.id,
                wallet_id: (walletData as any).id,
                type: 'payment',
                amount: totalPrice,
                balance_before: walletBalance,
                balance_after: newBalance,
                description: `Thanh toán máy chủ: ${serverName}`,
                status: 'completed',
              })

              setBalanceDeducted(true)
            } else {
              setBalanceDeducted(false)
            }
          } else {
            setBalanceDeducted(false)
          }
        } catch {
          setBalanceDeducted(false)
        }
      } else {
        // Chuyển khoản ngân hàng — đặt hàng nhưng không trừ ví ngay
        setBalanceDeducted(false)
      }

      // 6. Success
      setOrderPlaced(true)
    } catch (err: any) {
      setOrderError(err?.message ?? 'Không thể đặt hàng.')
    } finally {
      // 7. finally
      setOrdering(false)
    }
  }

  const INPUT = 'w-full bg-gray-950 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all'

  return (
    <div className="flex flex-row h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto bg-gray-950 px-8 py-6">
        <div className="mb-6">
          <div className="text-2xl font-bold text-white">Cấu hình máy chủ</div>
          <div className="text-sm text-gray-400 mt-2">Tùy chỉnh từng thông số theo nhu cầu thực tế của bạn.</div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* LEFT */}
          <div className="flex-1">
            {/* SECTION 1 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag size={16} className="text-cyan-400" />
                Tên máy chủ
              </div>

              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className={INPUT}
              />
              {!nameValid && serverName.trim().length > 0 && (
                <div className="mt-2 text-sm text-red-400">Tên không hợp lệ</div>
              )}
            </div>

            {/* SECTION 2 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Cpu size={16} className="text-violet-400" />
                CPU / Bộ xử lý
              </div>

              <div className="grid grid-cols-2 gap-3">
                {CPU_OPTIONS.map((opt) => {
                  const selected = cpu.id === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCpu(opt)}
                      className={selected ? 'bg-violet-900/30 border-2 border-violet-500 rounded-xl p-4 border' : 'bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-gray-500'}
                    >
                      <div className="text-sm font-semibold text-white">{opt.label}</div>
                      <div className="mt-2 text-xs text-gray-400">{opt.cores} nhân xử lý</div>
                      <div className="mt-2 text-sm font-semibold text-violet-400">
                        {formatVND(opt.price)}/tháng
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SECTION 3 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database size={16} className="text-blue-400" />
                RAM / Bộ nhớ
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {RAM_OPTIONS.map((opt) => {
                  const selected = ram.id === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRam(opt)}
                      className={
                        selected
                          ? 'bg-blue-900/30 border-2 border-blue-400 rounded-xl p-3'
                          : 'bg-gray-800/50 border border-gray-700 rounded-xl p-3 hover:border-blue-400/60'
                      }
                    >
                      <div className="text-sm font-semibold text-white">{opt.label}</div>
                      <div className="mt-2 text-xs text-blue-300 font-semibold">{formatVND(opt.price)}/tháng</div>
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {DDR_OPTIONS.map((opt) => {
                  const selected = ddr.id === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDdr(opt)}
                      className={
                        selected
                          ? 'bg-blue-900/30 border border-blue-400 rounded-lg px-3 py-2 text-left'
                          : 'bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-left hover:border-gray-500'
                      }
                    >
                      <div className="text-sm font-semibold text-white">{opt.label}</div>
                      {opt.price > 0 ? (
                        <div className="text-xs text-blue-300 font-semibold mt-1">+{formatVND(opt.price)}/tháng</div>
                      ) : (
                        <div className="text-xs text-gray-400 mt-1">Miễn phí</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SECTION 4 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <HardDrive size={16} className="text-amber-400" />
                Lưu trữ
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {STORAGE_OPTIONS.map((opt) => {
                  const selected = storage.id === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStorage(opt)}
                      className={
                        selected
                          ? 'bg-amber-900/30 border-2 border-amber-400 rounded-xl p-3'
                          : 'bg-gray-800/50 border border-gray-700 rounded-xl p-3 hover:border-amber-400/60'
                      }
                    >
                      <div className="text-sm font-semibold text-white">{opt.label}</div>
                      <div className="mt-2 text-xs text-amber-300 font-semibold">{formatVND(opt.price)}/tháng</div>
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {STORAGE_TYPE_OPTIONS.map((opt) => {
                  const selected = storageType.id === opt.id
                  const recommended = opt.id === 'nvme'
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStorageType(opt)}
                      className={
                        selected
                          ? 'bg-amber-900/30 border-2 border-amber-400 rounded-xl p-3'
                          : 'bg-gray-800/50 border border-gray-700 rounded-xl p-3 hover:border-amber-400/60'
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-white">{opt.label}</div>
                        {recommended && (
                          <div className="bg-amber-500/20 text-amber-300 text-xs px-1.5 py-0.5 rounded">
                            Khuyến nghị
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">{opt.desc}</div>
                      <div className="mt-2 text-xs text-amber-300 font-semibold">
                        {opt.price > 0 ? `+${formatVND(opt.price)}/tháng` : 'Miễn phí'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SECTION 5 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Monitor size={16} className="text-green-400" />
                Hệ điều hành
              </div>

              <div className="space-y-3">
                {OS_OPTIONS.map((opt) => {
                  const selected = os.id === opt.id
                  const showPaid = opt.id === 'windows-22' && opt.price > 0
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOs(opt)}
                      className={`w-full flex items-center justify-between gap-4 rounded-lg border px-4 py-3 ${
                        selected ? 'border-green-400 bg-green-400/20' : 'border-gray-600 bg-gray-950'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`relative inline-flex h-4 w-4 rounded-full ${
                            selected ? 'border border-green-400 bg-green-400/20' : 'border border-gray-600 bg-gray-950'
                          }`}
                        >
                          <span
                            className={`absolute inset-0 m-auto h-2 w-2 rounded-full ${
                              selected ? 'bg-green-400' : 'bg-transparent'
                            }`}
                          />
                        </span>
                        <div className="text-sm font-semibold text-white">{opt.label}</div>
                      </div>

                      {showPaid ? (
                        <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded">
                          +{formatVND(opt.price)}/tháng
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Miễn phí</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SECTION 6 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Wifi size={16} className="text-cyan-400" />
                Băng thông
              </div>

              <div className="flex flex-wrap gap-2">
                {BANDWIDTH_OPTIONS.map((opt) => {
                  const selected = bandwidth.id === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBandwidth(opt)}
                      className={
                        selected
                          ? 'bg-cyan-500/20 border border-cyan-400 rounded-lg px-4 py-2 text-white'
                          : 'bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 hover:border-gray-500'
                      }
                    >
                      <div className="text-sm font-semibold">{opt.label}</div>
                      {opt.price > 0 && (
                        <div className="text-xs text-cyan-300 font-semibold mt-1">+{formatVND(opt.price)}/tháng</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SECTION 7 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CalendarDays size={16} className="text-pink-400" />
                Chu kỳ thanh toán
              </div>

              <div className="grid grid-cols-3 gap-3">
                {BILLING_OPTIONS.map((opt) => {
                  const selected = billing.id === opt.id
                  const discounted = Math.round(baseMonthly * (1 - opt.discount))
                  const discountPct = Math.round(opt.discount * 100)
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBilling(opt)}
                      className={
                        selected
                          ? 'bg-pink-900/30 border-2 border-pink-500 rounded-xl p-4'
                          : 'bg-gray-800/50 border border-gray-700 rounded-xl p-4'
                      }
                    >
                      <div className="text-sm font-semibold text-white">{opt.label}</div>
                      {opt.discount > 0 ? (
                        <div className="text-xs text-green-400 font-semibold mt-1">Giảm {discountPct}%</div>
                      ) : (
                        <div className="text-xs text-gray-500 mt-1">Không giảm</div>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        Giá/tháng: <span className="text-white font-semibold">{formatVND(discounted)}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT - SUMMARY CARD */}
          <div className="w-full xl:w-96 xl:sticky xl:top-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-lg font-semibold text-white mb-4">Tóm tắt</div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">Tên máy chủ</div>
                  <div className="text-white font-medium">{serverName || '—'}</div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">CPU</div>
                  <div className="text-white font-medium">{cpu.label}</div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">RAM + DDR</div>
                  <div className="text-white font-medium">
                    {ram.label} {ddr.label}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">Lưu trữ</div>
                  <div className="text-white font-medium">
                    {storage.label} {storageType.label}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">HĐH</div>
                  <div className="text-white font-medium">{os.label}</div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">Băng thông</div>
                  <div className="text-white font-medium">{bandwidth.label}</div>
                </div>
              </div>

              <div className="my-4 border-t border-gray-800" />

              <div className="text-sm text-gray-300">
                <div className="flex justify-between mb-2">
                  <div className="text-gray-500">Giá gốc/tháng</div>
                  <div className="text-white font-medium">{formatVND(baseMonthly)}</div>
                </div>
                {billing.discount > 0 && (
                  <div className="flex justify-between mb-2">
                    <div className="text-green-400 font-semibold">Giảm {Math.round(billing.discount * 100)}%</div>
                    <div className="text-white font-medium">{formatVND(discountedMonthly)}</div>
                  </div>
                )}
                {billing.discount === 0 && (
                  <div className="flex justify-between">
                    <div className="text-gray-500">Giá sau giảm/tháng</div>
                    <div className="text-white font-medium">{formatVND(discountedMonthly)}</div>
                  </div>
                )}
              </div>

              <div className="my-4 border-t border-gray-800" />

              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-gray-500 text-sm">Tổng thanh toán</div>
                  <div className="text-xs text-gray-400 mt-1">{periodLabel}</div>
                </div>
                <div className="text-2xl font-bold text-cyan-400">{formatVND(totalPrice)}</div>
              </div>

              {saved > 0 && (
                <div className="mt-3 p-3 bg-green-950 border border-green-800 rounded-lg text-green-400 text-sm font-semibold">
                  Bạn tiết kiệm: {formatVND(saved)}
                </div>
              )}

              {/* PHƯƠNG THỨC THANH TOÁN */}
              <div className="text-xs text-gray-500 mb-2 mt-4">Phương thức thanh toán</div>
              <div className="flex flex-col gap-2">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setPaymentMethod('wallet')}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === 'wallet'
                      ? 'border-cyan-600 bg-cyan-950/30'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                      paymentMethod === 'wallet'
                        ? 'border-cyan-400 bg-cyan-400'
                        : 'border-gray-600'
                    }`}
                  />
                  <div className="flex flex-col flex-1">
                    <div className="text-sm text-white font-medium">Ví Hosting1s</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Wallet size={11} className="text-gray-500" />
                      <div className="text-xs text-gray-500">
                        Số dư: {formatVND(walletBalance)}
                      </div>
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        walletBalance >= totalPrice ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {walletBalance >= totalPrice ? 'Đủ số dư' : '(không đủ số dư)'}
                    </div>
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === 'bank'
                      ? 'border-cyan-600 bg-cyan-950/30'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                      paymentMethod === 'bank'
                        ? 'border-cyan-400 bg-cyan-400'
                        : 'border-gray-600'
                    }`}
                  />
                  <div className="flex flex-col flex-1">
                    <div className="text-sm text-white font-medium">Chuyển khoản ngân hàng</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Xác nhận thủ công trong 5–15 phút
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethod === 'wallet' && walletBalance < totalPrice && (
                <div className="bg-amber-900/20 border border-amber-800/40 rounded-lg p-2.5 mt-2 flex items-start gap-2">
                  <AlertCircle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-300 flex items-start gap-1">
                    <span>Số dư không đủ. </span>
                    <button
                      type="button"
                      onClick={() => navigate('/wallet')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Nạp tiền ngay →
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <label className="block text-sm text-gray-400 mb-2">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Để chúng tôi xác nhận đơn hàng"
                  className={INPUT}
                />
              </div>

              {orderError && <div className="mt-3 p-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">{orderError}</div>}

              <div className="mt-5">
                {orderPlaced ? (
                  <div className="flex flex-col items-center justify-center text-center gap-3 p-5 rounded-xl bg-green-950 border border-green-800">
                    <CheckCircle size={32} className="text-green-400" />
                    <div className="text-lg font-semibold text-green-400">Đặt hàng thành công!</div>
                    <div className="text-sm text-gray-400">Chúng tôi sẽ liên hệ xác nhận trong vòng 15 phút.</div>

                    {balanceDeducted ? (
                      <div className="flex items-center gap-1.5 mt-2">
                        <CheckCircle2 size={14} className="text-green-400" />
                        <div className="text-sm text-green-400">
                          Đã thanh toán {formatVND(totalPrice)} từ ví.
                        </div>
                      </div>
                    ) : paymentMethod === 'wallet' ? (
                      <div className="bg-amber-900/20 border border-amber-800/40 rounded-lg p-3 mt-3 w-full">
                        <div className="text-xs text-amber-300 mb-2">
                          Số dư không đủ — đơn hàng đã đặt nhưng chưa thanh toán.
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/wallet')}
                          className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg"
                        >
                          Nạp tiền vào ví ngay
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock size={14} className="text-gray-400" />
                        <div className="text-sm text-gray-400">Chờ xác nhận chuyển khoản từ admin.</div>
                      </div>
                    )}

                    <div className="flex gap-3 w-full mt-2">
                      <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Về Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={resetState}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Đặt thêm
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleOrder}
                      disabled={!nameValid || !serverName.trim() || !contactPhone.trim() || ordering}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed justify-center"
                    >
                      {ordering ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Đang đặt hàng...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} />
                          Đặt máy chủ ngay
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              <div className="text-xs text-gray-600 flex gap-4 justify-center mt-4">
                <span className="flex items-center gap-2">
                  <Shield size={14} /> Bảo mật SSL
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={14} /> Kích hoạt trong 15 phút
                </span>
                <span className="flex items-center gap-2">
                  <Zap size={14} /> Uptime 99.9%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

