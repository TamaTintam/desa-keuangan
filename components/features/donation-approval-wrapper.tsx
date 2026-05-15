'use client'

import { useState, useCallback } from "react"
import { DonationApprovalTable } from "./donation-approval-table" 
import type { Donation } from "@/types"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface DonationApprovalWrapperProps {
  initialDonations: Donation[]
}

export function DonationApprovalWrapper({ initialDonations }: DonationApprovalWrapperProps) {
  const [donations, setDonations] = useState<Donation[]>(initialDonations)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleApprove = useCallback(async (donation: Donation) => {
    setUpdatingId(donation.id)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('donations')
        .update({ 
          status: 'APPROVED',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', donation.id)

      if (error) throw error
      
      setDonations(prev => prev.filter(d => d.id !== donation.id))
      toast.success(`Donasi dari ${donation.donor_name} berhasil dikonfirmasi!`)
      
      setTimeout(() => window.location.reload(), 1000)
      
    } catch (error: any) {
      console.error('Full error object:', error)
      toast.error('Gagal: ' + (error.message || 'Unknown error'))
    } finally {
      setUpdatingId(null)
    }
  }, [])

  const handleReject = useCallback(async (donation: Donation, reason: string) => {
    setUpdatingId(donation.id)
    
    try {
      const supabase = createClient()
      
      // Format data dengan benar
      const updateData: any = {
        status: 'REJECTED',
        reviewed_at: new Date().toISOString()
      }
      
      // Hanya tambahkan rejection_reason jika ada isinya
      if (reason && reason.trim()) {
        updateData.rejection_reason = reason.trim()
      }
      
      console.log('Sending update:', updateData)
      console.log('For donation ID:', donation.id)
      
      const { data, error } = await supabase
        .from('donations')
        .update(updateData)
        .eq('id', donation.id)
        .select()

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }
      
      console.log('Success:', data)
      
      setDonations(prev => prev.filter(d => d.id !== donation.id))
      toast.success('Donasi ditolak')
      
      setTimeout(() => window.location.reload(), 1000)
      
    } catch (error: any) {
      console.error('Full error:', error)
      toast.error('Gagal menolak: ' + (error.message || error.code || 'Unknown error'))
    } finally {
      setUpdatingId(null)
    }
  }, [])

  if (donations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Semua donasi sudah diproses.</p>
      </div>
    )
  }

  return (
    <DonationApprovalTable 
      donations={donations}
      showPagination
      onApprove={handleApprove}
      onReject={handleReject}
      updatingId={updatingId}
    />
  )
}
