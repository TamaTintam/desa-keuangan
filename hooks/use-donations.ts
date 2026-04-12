'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Donation } from '@/types'

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDonations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const addDonation = async (donation: Omit<Donation, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .insert([donation])
        .select()
        .single()

      if (error) throw error
      setDonations(prev => [data, ...prev])
      return data
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  return {
    donations,
    loading,
    error,
    refetch: fetchDonations,
    addDonation,
  }
}
