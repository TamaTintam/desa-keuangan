'use client'

import { useState } from "react"
import { BalanceCard } from "@/components/features/balance-card"
import { DonationDetailDialog } from "@/components/features/donation-detail-dialog"
import type { Donation } from "@/types"

interface BalanceCardWithDialogProps {
  title: string
  amount: number
  type: "masjid" | "dusun"
  description?: string
  donations: Donation[]
  category: 'MASJID' | 'DUSUN'
  selectedMonth?: string
  selectedYear?: string
}

export function BalanceCardWithDialog({ 
  title, 
  amount, 
  type, 
  description,
  donations,
  category,
  selectedMonth = "all",
  selectedYear = "all"
}: BalanceCardWithDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filter donations untuk dialog
  const filteredDonations = donations.filter(d => {
    if (d.category !== category) return false
    const date = new Date(d.date)
    const monthMatch = selectedMonth === "all" || date.getMonth() === parseInt(selectedMonth)
    const yearMatch = selectedYear === "all" || date.getFullYear() === parseInt(selectedYear)
    return monthMatch && yearMatch
  })

  return (
    <>
      <BalanceCard
        title={title}
        amount={amount}
        type={type}
        description={description}
        showDetailButton
        onDetailClick={() => setIsDialogOpen(true)}
      />
      <DonationDetailDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        category={category}
        donations={filteredDonations}
      />
    </>
  )
}
