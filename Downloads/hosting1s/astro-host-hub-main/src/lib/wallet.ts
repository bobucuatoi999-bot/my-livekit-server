import { supabase } from './supabase'

export const formatVND = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    .replace('₫', '')
    .trim() + ' ₫'

export async function getOrCreateWallet(userId: string) {
  const { data, error } = await supabase.rpc('get_or_create_wallet', { p_user_id: userId })
  if (error) throw error
  return data
}

export async function createTopupRequest(userId: string, amount: number) {
  const { data, error } = await supabase.rpc('create_topup_request', { p_user_id: userId, p_amount: amount })
  if (error) throw error
  return data
}

