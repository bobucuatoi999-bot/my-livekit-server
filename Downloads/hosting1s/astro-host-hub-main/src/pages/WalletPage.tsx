import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Copy, Loader2, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { createTopupRequest, formatVND, getOrCreateWallet } from '../lib/wallet'

type TxType = 'topup' | 'payment' | 'refund' | 'bonus'
type TxFilter = 'all' | TxType

type WalletRow = {
  id: string
  user_id: string
  balance: number | string
  total_topped: number | string
  total_spent: number | string
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [transactions, setTransactions] = useState<any[]>([])
  const [filter, setFilter] = useState<TxFilter>('all')

  const [topupAmount, setTopupAmount] = useState<number>(200000)
  const [selectedQuick, setSelectedQuick] = useState<number | null>(200000)
  const [customInput, setCustomInput] = useState('200000')
  const [creating, setCreating] = useState(false)
  const [topupError, setTopupError] = useState<string | null>(null)
  const [createdRequest, setCreatedRequest] = useState<any | null>(null)

  const [copiedField, setCopiedField] = useState<string>('')
  const copyTimeoutRef = useRef<number | null>(null)

  const [topupRequests, setTopupRequests] = useState<any[]>([])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      setError(null)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError('Phiên đăng nhập đã hết hạn.')
          setWallet(null)
          setTransactions([])
          setTopupRequests([])
          return
        }

        setUserId(user.id)

        // Wallet
        const w = await getOrCreateWallet(user.id)
        setWallet(w as WalletRow)

        // Transactions
        const { data: txs, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (txError) throw txError
        setTransactions((txs ?? []) as any[])

        // Topup history
        const { data: reqs } = await supabase
          .from('topup_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        setTopupRequests((reqs ?? []) as any[])
      } catch (e: any) {
        setError(e?.message ?? 'Không thể tải dữ liệu ví.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const reloadWallet = async (uid: string) => {
    const w = await getOrCreateWallet(uid)
    setWallet(w as WalletRow)

    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!txError) setTransactions((txs ?? []) as any[])

    const { data: reqs } = await supabase
      .from('topup_requests')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(10)
    setTopupRequests((reqs ?? []) as any[])
  }

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions
    return transactions.filter((tx) => tx.type === filter)
  }, [transactions, filter])

  // Derive displayed wallet numbers from transaction history when needed.
  // This prevents UI showing stale `wallets.balance` after some balance updates.
  const derived = useMemo(() => {
    const completedTxs = transactions.filter((tx) => tx.status === 'completed' || tx.status == null)
    const latestCompleted = completedTxs[0]

    const derivedBalance =
      latestCompleted && latestCompleted.balance_after != null
        ? Number(latestCompleted.balance_after)
        : wallet
          ? Number(wallet.balance ?? 0)
          : 0

    const derivedTopped = completedTxs
      .filter((tx) => tx.type === 'topup')
      .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0)

    const derivedSpent = completedTxs
      .filter((tx) => tx.type === 'payment')
      .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0)

    return { derivedBalance, derivedTopped, derivedSpent }
  }, [transactions, wallet])

  const QUICK_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000]

  const shortQuick = (n: number) => (n >= 1000000 ? `${n / 1000000}Tr` : `${n / 1000}K`)

  const amountToNumber = (v: string) => {
    if (!v) return 0
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const onQuickPick = (v: number) => {
    setSelectedQuick(v)
    setTopupAmount(v)
    setCustomInput(String(v))
    setTopupError(null)
  }

  const onCustomChange = (v: string) => {
    setSelectedQuick(null)
    setCustomInput(v)
    setTopupAmount(amountToNumber(v))
    setTopupError(null)
  }

  const invalidMin = topupAmount < 50000
  const invalidMax = topupAmount > 100000000

  const badgeClass = (t: TxType) => {
    switch (t) {
      case 'topup':
        return 'bg-green-900/40 text-green-400 border border-green-800/50'
      case 'payment':
        return 'bg-red-900/40 text-red-400 border border-red-800/50'
      case 'refund':
        return 'bg-blue-900/40 text-blue-400 border border-blue-800/50'
      case 'bonus':
        return 'bg-amber-900/40 text-amber-400 border border-amber-800/50'
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700'
    }
  }

  const badgeLabel = (t: TxType) => {
    switch (t) {
      case 'topup':
        return 'Nạp tiền'
      case 'payment':
        return 'Thanh toán'
      case 'refund':
        return 'Hoàn tiền'
      case 'bonus':
        return 'Khuyến mãi'
      default:
        return t
    }
  }

  const txDescription = (tx: any) => (tx.description ? String(tx.description) : '—')

  const txAmountText = (tx: any) => {
    const amount = Number(tx.amount ?? 0)
    if (tx.type === 'payment') return `-${formatVND(amount)}`
    return `+${formatVND(amount)}`
  }

  const copyToClipboard = async (value: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(fieldKey)
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = window.setTimeout(() => setCopiedField(''), 2000)
    } catch {
      // ignore copy errors
    }
  }

  const QUICK_TOOLTIP = 'Đã sao chép!'

  const handleCreateTopup = async () => {
    setTopupError(null)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setTopupError('Phiên đăng nhập đã hết hạn.')
      return
    }

    if (topupAmount < 50000 || topupAmount > 100000000) {
      setTopupError('Số tiền nạp không hợp lệ.')
      return
    }

    setCreating(true)
    try {
      const res = await createTopupRequest(user.id, Math.round(topupAmount))
      setCreatedRequest(res)
      // Cập nhật nhanh danh sách yêu cầu để người dùng thấy ngay kết quả
      setTopupRequests((prev) => [res, ...prev].slice(0, 10))

      // Refresh numbers so số dư và tổng hiển thị đúng theo transaction.
      await reloadWallet(user.id)
    } catch (e: any) {
      setTopupError(e?.message ?? 'Không thể tạo lệnh nạp tiền.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-gray-950">
      <Sidebar />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center text-cyan-400">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : error ? (
          <div className="text-red-400 mt-4 text-sm">{error}</div>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-medium text-white">Ví & Số dư</h1>
              <div className="text-xs text-gray-600 mt-0.5 mb-6">
                Quản lý số dư và lịch sử giao dịch tài khoản.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-4">
                <div className="flex items-center justify-end">
                  <div className="text-xl font-semibold text-cyan-400">
                    {wallet ? formatVND(derived.derivedBalance) : '...'}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Wallet size={14} className="text-cyan-400 shrink-0" />
                  Số dư khả dụng
                </div>
                <div className="text-xs text-gray-600">Sẵn sàng sử dụng</div>
              </div>

              <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-4">
                <div className="flex items-center justify-end">
                  <div className="text-lg font-semibold text-white">
                    {wallet ? formatVND(derived.derivedTopped) : '...'}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <TrendingUp size={14} className="text-green-400 shrink-0" />
                  Tổng đã nạp
                </div>
                <div className="text-xs text-gray-600">Tích lũy từ trước đến nay</div>
              </div>

              <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-4">
                <div className="flex items-center justify-end">
                  <div className="text-lg font-semibold text-white">
                    {wallet ? formatVND(derived.derivedSpent) : '...'}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <TrendingDown size={14} className="text-red-400 shrink-0" />
                  Tổng đã chi
                </div>
                <div className="text-xs text-gray-600">Thanh toán dịch vụ</div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
              {/* LEFT COLUMN */}
              <div className="flex-1">
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
                    <div className="text-base font-normal text-white">Lịch sử giao dịch</div>
                    <div className="flex gap-2">
                      {(
                        [
                          ['all', 'Tất cả'],
                          ['topup', 'Nạp tiền'],
                          ['payment', 'Thanh toán'],
                          ['refund', 'Hoàn tiền'],
                          ['bonus', 'Khuyến mãi'],
                        ] as Array<[TxFilter, string]>
                      ).map(([key, label]) => {
                        const active = filter === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFilter(key)}
                            className={
                              active
                                ? 'bg-cyan-600 text-white text-xs px-2.5 py-1 rounded-lg'
                                : 'bg-gray-800 text-gray-400 hover:text-white text-xs px-2.5 py-1 rounded-lg'
                            }
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="hidden md:flex px-5 py-2 border-b border-gray-800 text-xs text-gray-600 uppercase tracking-wider">
                      <div className="w-28">Loại</div>
                      <div className="flex-1">Mô tả</div>
                      <div className="w-32 text-right">Số tiền</div>
                      <div className="w-32 text-right">Số dư sau</div>
                      <div className="w-36 text-right">Thời gian</div>
                    </div>

                    {filteredTransactions.length === 0 ? (
                      <div className="text-gray-500 py-12 flex items-center justify-center text-sm">
                        Chưa có giao dịch nào.
                      </div>
                    ) : (
                      <div>
                        {filteredTransactions.map((tx) => {
                          const type: TxType = tx.type
                          const amount = Number(tx.amount ?? 0)
                          const balanceAfter = Number(tx.balance_after ?? 0)
                          const created = new Date(tx.created_at)

                          return (
                            <div
                              key={tx.id}
                              className="flex items-center gap-4 px-5 py-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors"
                            >
                              <div className="w-24 shrink-0">
                                <div className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${badgeClass(type)}`}>
                                  {badgeLabel(type)}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white truncate">{txDescription(tx)}</div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  {created.toLocaleDateString('vi-VN')}
                                </div>
                              </div>

                              <div className="w-32 text-right shrink-0 text-sm font-semibold">
                                {type === 'payment' ? (
                                  <span className="text-red-400">{txAmountText(tx)}</span>
                                ) : (
                                  <span className="text-green-400">{txAmountText(tx)}</span>
                                )}
                              </div>

                              <div className="w-32 text-right shrink-0 hidden xl:block text-sm">
                                <div className="text-gray-400">{formatVND(balanceAfter)}</div>
                              </div>

                              <div className="w-36 text-right shrink-0 hidden lg:block">
                                <div className="text-xs text-gray-500">
                                  {created.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="w-full xl:w-80 shrink-0">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-5">
                  <div className="text-sm font-medium text-white mb-4">Nạp tiền vào ví</div>

                  <div className="text-xs text-gray-500 mb-2">Chọn số tiền cần nạp</div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {QUICK_AMOUNTS.map((n) => {
                      const active = selectedQuick === n
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => onQuickPick(n)}
                          className={
                            active
                              ? 'bg-cyan-600 text-white rounded-lg py-1 text-xs font-medium'
                              : 'bg-gray-800 text-gray-400 hover:text-white rounded-lg py-1 text-xs font-medium transition-colors'
                          }
                        >
                          {shortQuick(n)}
                        </button>
                      )
                    })}
                  </div>

                  <div className="text-xs text-gray-600 mb-1">Hoặc nhập số tiền khác</div>
                  <input
                    type="number"
                    min={50000}
                    step={10000}
                    value={customInput}
                    onChange={(e) => onCustomChange(e.target.value)}
                    placeholder="Tối thiểu 50.000 ₫"
                    className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />

                  {(invalidMin || invalidMax) && (
                    <div className="mt-2">
                      {invalidMin && (
                        <div className="text-red-400 text-xs">Số tiền tối thiểu là 50.000 ₫</div>
                      )}
                      {invalidMax && (
                        <div className="text-red-400 text-xs">Số tiền tối đa là 100.000.000 ₫</div>
                      )}
                    </div>
                  )}

                  {createdRequest ? (
                    <div className="bg-gray-950 border border-cyan-800/50 rounded-xl p-4 mt-4">
                      <div className="text-sm font-medium text-cyan-400 mb-3">Thông tin chuyển khoản</div>

                      {(() => {
                        const bankName = String(createdRequest.bank_name ?? 'CAKE by VPBank')
                        const accountNumber = String(createdRequest.account_number ?? '0912863155')
                        const accountName = String(createdRequest.account_name ?? 'DINH BUI DUY AN')

                        return (
                          <>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <div className="text-sm text-gray-400">Ngân hàng</div>
                        <div className="text-sm text-white">{bankName}</div>
                      </div>

                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <div className="text-sm text-gray-400">Số tài khoản</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-white font-mono font-bold">
                            {accountNumber}
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(accountNumber, 'account_number')}
                            className="p-1 rounded hover:bg-gray-800"
                            aria-label="Sao chép số tài khoản"
                          >
                            <Copy size={12} className="text-gray-300" />
                          </button>
                        </div>
                      </div>

                      {copiedField === 'account_number' && (
                        <div className="text-xs text-gray-300 mt-1">Đã sao chép!</div>
                      )}

                      <div className="flex justify-between py-2 border-b border-gray-800 last:border-0">
                        <div className="text-sm text-gray-400">Tên tài khoản</div>
                        <div className="text-sm text-white">{accountName}</div>
                      </div>

                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <div className="text-sm text-gray-400">Số tiền</div>
                        <div className="text-sm text-cyan-400 font-bold">{formatVND(Number(createdRequest.amount ?? 0))}</div>
                      </div>

                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <div className="text-sm text-gray-400">Nội dung CK</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-amber-400 font-mono font-bold">
                            {createdRequest.transfer_code}
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(String(createdRequest.transfer_code ?? ''), 'transfer_code')}
                            className="p-1 rounded hover:bg-gray-800"
                            aria-label="Sao chép nội dung chuyển khoản"
                          >
                            <Copy size={12} className="text-gray-300" />
                          </button>
                        </div>
                      </div>

                      {copiedField === 'transfer_code' && (
                        <div className="text-xs text-gray-300 mt-1">Đã sao chép!</div>
                      )}

                      <div className="bg-amber-900/20 border border-amber-800/40 rounded-lg p-3 mt-3 flex items-start gap-2">
                        <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-300">
                          <div>Vui lòng chuyển khoản đúng NỘI DUNG để hệ thống tự động xác nhận.</div>
                          <div>Số dư sẽ được cộng trong vòng 5–15 phút sau khi chuyển thành công.</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCreatedRequest(null)}
                        className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 rounded-lg"
                      >
                        Tạo lệnh nạp khác
                      </button>
                        </>
                        )
                      })()}
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleCreateTopup}
                        disabled={topupAmount < 50000 || creating}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {creating ? <Loader2 size={16} className="animate-spin" /> : 'Tạo lệnh nạp tiền'}
                      </button>

                      {topupError && (
                        <div className="mt-3 p-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">
                          {topupError}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="text-sm font-normal text-white px-5 py-4 border-b border-gray-800">
                    Yêu cầu nạp tiền
                  </div>

                  {topupRequests.length === 0 ? (
                    <div className="text-gray-500 text-sm px-5 py-6 text-center">
                      Chưa có yêu cầu nạp tiền.
                    </div>
                  ) : (
                    <div>
                      {topupRequests.map((req) => {
                        const status = String(req.status ?? 'pending')
                        const badge = (() => {
                          if (status === 'pending') return { cls: 'bg-amber-900/40 text-amber-400', text: 'Chờ xác nhận' }
                          if (status === 'confirmed') return { cls: 'bg-green-900/40 text-green-400', text: 'Đã xác nhận' }
                          return { cls: 'bg-red-900/40 text-red-400', text: 'Từ chối' }
                        })()

                        return (
                          <div key={req.id} className="px-4 py-2.5 border-b border-gray-800 last:border-0">
                            <div className="flex justify-between">
                              <div className="text-xs font-mono text-gray-400">{req.transfer_code}</div>
                              <div className={`text-xs px-2 py-0.5 rounded font-medium ${badge.cls}`}>{badge.text}</div>
                            </div>

                            <div className="flex justify-between mt-1">
                              <div className="text-sm font-medium text-white">{formatVND(Number(req.amount ?? 0))}</div>
                              <div className="text-xs text-gray-600">
                                {req.created_at ? new Date(req.created_at).toLocaleDateString('vi-VN') : ''}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

