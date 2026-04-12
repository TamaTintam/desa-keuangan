"use client"

import { formatRupiah } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, Wallet, Building2, Home } from "lucide-react"
import type { FinancialSummary as SummaryType } from "@/types"

interface FinancialSummaryProps {
  data: SummaryType
}

export function FinancialSummary({ data }: FinancialSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Total Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Ringkasan Keseluruhan
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <ArrowUpCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Total Pemasukan</span>
            </div>
            <p className="text-2xl font-bold">{formatRupiah(data.totalIncome)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600">
              <ArrowDownCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Total Pengeluaran</span>
            </div>
            <p className="text-2xl font-bold">{formatRupiah(data.totalExpense)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-medium">Saldo Total</span>
            </div>
            <p className="text-2xl font-bold">{formatRupiah(data.totalBalance)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Masjid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Masjid
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pemasukan</span>
              <span className="font-bold text-green-600">+{formatRupiah(data.totalIncomeMasjid)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pengeluaran</span>
              <span className="font-bold text-red-600">-{formatRupiah(data.totalExpenseMasjid)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Saldo</span>
                <span className={`font-bold ${data.balanceMasjid >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatRupiah(data.balanceMasjid)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dusun */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Dusun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pemasukan</span>
              <span className="font-bold text-green-600">+{formatRupiah(data.totalIncomeDusun)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pengeluaran</span>
              <span className="font-bold text-red-600">-{formatRupiah(data.totalExpenseDusun)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Saldo</span>
                <span className={`font-bold ${data.balanceDusun >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatRupiah(data.balanceDusun)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
