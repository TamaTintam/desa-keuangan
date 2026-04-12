'use client'

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { formatRupiah } from "@/lib/utils"
import { BalanceCardWithDialog } from "@/components/features/balance-card-with-dialog"
import { FinancialChart } from "@/components/features/financial-chart"
import { TransactionList } from "@/components/features/transaction-list"
import type { Transaction, Donation } from "@/types"
import { Calendar, Filter, X, Wallet, Building2, Home, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TransparencyContentProps {
  transactions: Transaction[]
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

export function TransparencyContent({ transactions, donations }: TransparencyContentProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")

  // Get available years from data
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    transactions.forEach(t => years.add(new Date(t.date).getFullYear()))
    donations.forEach(d => years.add(new Date(d.date).getFullYear()))
    return Array.from(years).sort((a, b) => b - a)
  }, [transactions, donations])

  // Filter transactions based on month and year
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date)
      const monthMatch = selectedMonth === "all" || date.getMonth() === parseInt(selectedMonth)
      const yearMatch = selectedYear === "all" || date.getFullYear() === parseInt(selectedYear)
      return monthMatch && yearMatch
    })
  }, [transactions, selectedMonth, selectedYear])

  // Calculate totals for Masjid
  const masjidData = useMemo(() => {
    const masjidTrans = filteredTransactions.filter(t => t.category === 'MASJID')
    const masjidDons = donations.filter(d => {
      const date = new Date(d.date)
      const monthMatch = selectedMonth === "all" || date.getMonth() === parseInt(selectedMonth)
      const yearMatch = selectedYear === "all" || date.getFullYear() === parseInt(selectedYear)
      return d.category === 'MASJID' && monthMatch && yearMatch
    })

    const income = masjidTrans
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0) +
      masjidDons.reduce((sum, d) => sum + d.amount, 0)

    const expense = masjidTrans
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    return { income, expense, balance: income - expense }
  }, [filteredTransactions, donations, selectedMonth, selectedYear])

  // Calculate totals for Dusun
  const dusunData = useMemo(() => {
    const dusunTrans = filteredTransactions.filter(t => t.category === 'DUSUN')
    const dusunDons = donations.filter(d => {
      const date = new Date(d.date)
      const monthMatch = selectedMonth === "all" || date.getMonth() === parseInt(selectedMonth)
      const yearMatch = selectedYear === "all" || date.getFullYear() === parseInt(selectedYear)
      return d.category === 'DUSUN' && monthMatch && yearMatch
    })

    const income = dusunTrans
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0) +
      dusunDons.reduce((sum, d) => sum + d.amount, 0)

    const expense = dusunTrans
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    return { income, expense, balance: income - expense }
  }, [filteredTransactions, donations, selectedMonth, selectedYear])

  // Calculate total
  const totalData = useMemo(() => ({
    income: masjidData.income + dusunData.income,
    expense: masjidData.expense + dusunData.expense,
    balance: masjidData.balance + dusunData.balance
  }), [masjidData, dusunData])

  // Calculate by subcategory (for chart)
  const bySubCategory = useMemo(() => {
    const subCategories = ['INFAQ', 'SADAQAH', 'KEGIATAN', 'OPERASIONAL'] as const
    
    return Object.fromEntries(
      subCategories.map(sub => {
        const subTrans = filteredTransactions.filter(t => t.sub_category === sub)
        const income = subTrans
          .filter(t => t.type === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0)
        const expense = subTrans
          .filter(t => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0)
        return [sub, { income, expense }]
      })
    ) as {
      INFAQ: { income: number; expense: number }
      SADAQAH: { income: number; expense: number }
      KEGIATAN: { income: number; expense: number }
      OPERASIONAL: { income: number; expense: number }
    }
  }, [filteredTransactions])

  // Calculate by subcategory detail for Masjid vs Dusun comparison
  const bySubCategoryDetail = useMemo(() => {
    const subCategories = ['INFAQ', 'SADAQAH', 'KEGIATAN', 'OPERASIONAL'] as const
    
    return Object.fromEntries(
      subCategories.map(sub => {
        const subTrans = filteredTransactions.filter(t => 
          t.sub_category === sub && t.type === 'EXPENSE'
        )
        
        const masjid = subTrans
          .filter(t => t.category === 'MASJID')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const dusun = subTrans
          .filter(t => t.category === 'DUSUN')
          .reduce((sum, t) => sum + t.amount, 0)
        
        return [sub, { masjid, dusun }]
      })
    ) as {
      INFAQ: { masjid: number; dusun: number }
      SADAQAH: { masjid: number; dusun: number }
      KEGIATAN: { masjid: number; dusun: number }
      OPERASIONAL: { masjid: number; dusun: number }
    }
  }, [filteredTransactions])

  const hasActiveFilters = selectedMonth !== "all" || selectedYear !== "all"

  const clearFilters = () => {
    setSelectedMonth("all")
    setSelectedYear("all")
  }

  const getPeriodLabel = () => {
    if (!hasActiveFilters) return "Semua Periode"
    const month = MONTHS.find(m => m.value === selectedMonth)?.label
    const year = selectedYear === "all" ? "" : selectedYear
    if (selectedMonth === "all") return `Tahun ${year}`
    return `${month} ${year}`.trim()
  }

  return (
    <div className="space-y-8">
      {/* Filter Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Filter Periode</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {getPeriodLabel()}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-600">Bulan</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[140px] bg-white">
                      <SelectValue />
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

                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-600">Tahun</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px] bg-white">
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
              </div>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="gap-2 bg-white"
                  >
                    <X className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards - Sisa Saldo */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            Ringkasan Sisa Saldo
          </h2>
          <span className="text-sm text-gray-500">{getPeriodLabel()}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Saldo */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Total Sisa Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 mb-2">
                {formatRupiah(totalData.balance)}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <ArrowUpCircle className="h-3 w-3 text-emerald-500" />
                    Pemasukan
                  </span>
                  <span className="font-medium text-emerald-600">+{formatRupiah(totalData.income)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <ArrowDownCircle className="h-3 w-3 text-red-500" />
                    Pengeluaran
                  </span>
                  <span className="font-medium text-red-600">-{formatRupiah(totalData.expense)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Masjid Saldo */}
          <BalanceCardWithDialog
            title="Sisa Saldo Masjid"
            amount={masjidData.balance}
            type="masjid"
            description={`Pemasukan: ${formatRupiah(masjidData.income)} • Pengeluaran: ${formatRupiah(masjidData.expense)}`}
            donations={donations}
            category="MASJID"
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />

          {/* Dusun Saldo */}
          <BalanceCardWithDialog
            title="Sisa Saldo Dusun"
            amount={dusunData.balance}
            type="dusun"
            description={`Pemasukan: ${formatRupiah(dusunData.income)} • Pengeluaran: ${formatRupiah(dusunData.expense)}`}
            donations={donations}
            category="DUSUN"
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      </div>

      {/* Financial Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Grafik Pengeluaran per Kategori
          </CardTitle>
          <CardDescription>
            Perbandingan pengeluaran Masjid (Hijau) vs Dusun (Merah) untuk {getPeriodLabel()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialChart 
            bySubCategory={bySubCategory} 
            bySubCategoryDetail={bySubCategoryDetail}
          />
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Riwayat Transaksi</CardTitle>
            <CardDescription>
              Transaksi {getPeriodLabel()}
            </CardDescription>
          </div>
          {filteredTransactions.length > 0 && (
            <Badge variant="secondary">
              {filteredTransactions.length} transaksi
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <TransactionList 
            transactions={filteredTransactions.slice(0, 20)} 
            showCategory 
            showSubCategory 
          />
        </CardContent>
      </Card>
    </div>
  )
}
