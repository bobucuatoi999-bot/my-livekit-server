import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  created_at: string
  updated_at: string
}

export default function useProfile() {
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true); setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data, error: dbError } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    if (dbError) setError(dbError.message)
    else setProfile(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])
  return { profile, loading, error, refetch: fetchProfile }
}
