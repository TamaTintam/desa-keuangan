"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatRupiah, formatDate } from "@/lib/utils"
import type { Donation } from "@/types"
import { User, Calendar, Filter, X, Download } from "lucide-react"

interface DonationDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  category: 'MASJID' | 'DUSUN'
  donations: Donation[]
}

const MONTHS = [
  { value: "all", label: "Semua Bulan" },
  { value: "0", label: "Januari" },
  { value: "1", label: "Februari" },
  { value: "2", label: "Maret" },
  { value: "3", label: "April" },
  { value: "4", label: "Mei" },
  { value: "5", label: "Juni" },
  { value: "6", label: "Juli" },
  { value: "7", label: "Agustus" },
  { value: "8", label: "September" },
  { value: "9", label: "Oktober" },
  { value: "10", label: "November" },
  { value: "11", label: "Desember" },
]

export function DonationDetailDialog({ 
  isOpen, 
  onClose, 
  category, 
  donations 
}: DonationDetailDialogProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")

  // Generate available years from donations data
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    donations.forEach(d => {
      const year = new Date(d.date).getFullYear()
      years.add(year)
    })
    return Array.from(years).sort((a, b) => b - a) // Descending
  }, [donations])

  // Filter donations based on selected month and year
  const filteredDonations = useMemo(() => {
    return donations
      .filter(d => d.category === category)
      .filter(d => {
        const donationDate = new Date(d.date)
        const monthMatch = selectedMonth === "all" || donationDate.getMonth() === parseInt(selectedMonth)
        const yearMatch = selectedYear === "all" || donationDate.getFullYear() === parseInt(selectedYear)
        return monthMatch && yearMatch
      })
      .sort((a, b) => b.amount - a.amount)
  }, [donations, category, selectedMonth, selectedYear])

  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0)

  const clearFilters = () => {
    setSelectedMonth("all")
    setSelectedYear("all")
  }

  const hasActiveFilters = selectedMonth !== "all" || selectedYear !== "all"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Detail Donasi {category === 'MASJID' ? 'Masjid' : 'Dusun'}
          </DialogTitle>
          <DialogDescription>
            Daftar donatur dan jumlah donasi yang diberikan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter Data</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Month Filter */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Bulan</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Tahun</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tahun</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filter Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="w-full gap-2"
                >
                  <X className="h-4 w-4" />
                  Reset Filter
                </Button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                <span>Filter aktif:</span>
                {selectedMonth !== "all" && (
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                    {MONTHS.find(m => m.value === selectedMonth)?.label}
                  </span>
                )}
                {selectedYear !== "all" && (
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                    Tahun {selectedYear}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-600 mb-1">Total Donatur</p>
              <p className="text-2xl font-bold text-blue-700">
                {filteredDonations.length} <span className="text-sm font-normal">orang</span>
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 mb-1">Total Donasi</p>
              <p className="text-2xl font-bold text-green-700">
                {formatRupiah(totalAmount)}
              </p>
            </div>
          </div>

          {/* Donations Table */}
          {filteredDonations.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-2">
                Tidak ada data donasi untuk periode yang dipilih
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Reset Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 text-center">No</TableHead>
                    <TableHead>Nama Donatur</TableHead>
                    <TableHead>No. Resi</TableHead>
                    <TableHead className="text-right">Jumlah Donasi</TableHead>
                    <TableHead className="text-right">Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation, index) => (
                    <TableRow key={donation.id}>
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {donation.is_anonymous ? 'Hamba Allah' : donation.donor_name}
                            </p>
                            {donation.message && (
                              <p className="text-xs text-muted-foreground italic">
                                "{donation.message}"
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {donation.receipt_number}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-green-600">
                          {formatRupiah(donation.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center justify-end gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(donation.date)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
