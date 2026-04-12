import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { formatRupiah, formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"
import { FileText, Download, TrendingUp, TrendingDown, Wallet, Building2, Home, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

async function getReportData() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get all data
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  const { data: donations } = await supabase
    .from('donations')
    .select('*')

  // Calculate monthly data (last 6 months)
  const months = []
  const today = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    months.push({
      month: d.getMonth(),
      year: d.getFullYear(),
      label: d.toLocaleString('id-ID', { month: 'short', year: 'numeric' })
    })
  }

  const monthlyData = months.map(m => {
    const monthTrans = transactions?.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === m.month && date.getFullYear() === m.year
    }) || []

    const monthDons = donations?.filter(d => {
      const date = new Date(d.date)
      return date.getMonth() === m.month && date.getFullYear() === m.year
    }) || []

    const masjidIncome = monthTrans
      .filter(t => t.category === 'MASJID' && t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0) +
      monthDons.filter(d => d.category === 'MASJID').reduce((sum, d) => sum + d.amount, 0)

    const masjidExpense = monthTrans
      .filter(t => t.category === 'MASJID' && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const dusunIncome = monthTrans
      .filter(t => t.category === 'DUSUN' && t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0) +
      monthDons.filter(d => d.category === 'DUSUN').reduce((sum, d) => sum + d.amount, 0)

    const dusunExpense = monthTrans
      .filter(t => t.category === 'DUSUN' && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      ...m,
      masjid: { income: masjidIncome, expense: masjidExpense, balance: masjidIncome - masjidExpense },
      dusun: { income: dusunIncome, expense: dusunExpense, balance: dusunIncome - dusunExpense },
    }
  })

  // Summary
  const allMasjidIncome = transactions
    ?.filter(t => t.category === 'MASJID' && t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0) || 0
  const allMasjidDonations = donations
    ?.filter(d => d.category === 'MASJID')
    .reduce((sum, d) => sum + d.amount, 0) || 0

  const summary = {
    masjid: {
      income: allMasjidIncome + allMasjidDonations,
      expense: transactions?.filter(t => t.category === 'MASJID' && t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0) || 0,
    },
    dusun: {
      income: (transactions?.filter(t => t.category === 'DUSUN' && t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0) || 0) +
        (donations?.filter(d => d.category === 'DUSUN')
        .reduce((sum, d) => sum + d.amount, 0) || 0),
      expense: transactions?.filter(t => t.category === 'DUSUN' && t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0) || 0,
    }
  }

  return {
    monthlyData,
    summary: {
      masjid: { ...summary.masjid, balance: summary.masjid.income - summary.masjid.expense },
      dusun: { ...summary.dusun, balance: summary.dusun.income - summary.dusun.expense },
      total: {
        income: summary.masjid.income + summary.dusun.income,
        expense: summary.masjid.expense + summary.dusun.expense,
        balance: (summary.masjid.income + summary.dusun.income) - (summary.masjid.expense + summary.dusun.expense)
      }
    }
  }
}

export default async function LaporanPage() {
  const { monthlyData, summary } = await getReportData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Laporan Keuangan
          </h1>
          <p className="text-gray-500 mt-1">Rekapitulasi dan laporan keuangan desa</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-600 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Total Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700">{formatRupiah(summary.total.balance)}</p>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-emerald-600">+{formatRupiah(summary.total.income)}</span>
              <span className="text-red-600">-{formatRupiah(summary.total.expense)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-600 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Saldo Masjid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-700">{formatRupiah(summary.masjid.balance)}</p>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-emerald-600">+{formatRupiah(summary.masjid.income)}</span>
              <span className="text-red-600">-{formatRupiah(summary.masjid.expense)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-600 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Saldo Dusun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-700">{formatRupiah(summary.dusun.balance)}</p>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-emerald-600">+{formatRupiah(summary.dusun.income)}</span>
              <span className="text-red-600">-{formatRupiah(summary.dusun.expense)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Laporan Bulanan (6 Bulan Terakhir)
          </CardTitle>
          <CardDescription>Rekapitulasi per bulan untuk Masjid dan Dusun</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left p-4 font-medium">Periode</th>
                  <th className="text-right p-4 font-medium">Masjid Masuk</th>
                  <th className="text-right p-4 font-medium">Masjid Keluar</th>
                  <th className="text-right p-4 font-medium">Masjid Sisa</th>
                  <th className="text-right p-4 font-medium">Dusun Masuk</th>
                  <th className="text-right p-4 font-medium">Dusun Keluar</th>
                  <th className="text-right p-4 font-medium">Dusun Sisa</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((data, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-4 font-medium">{data.label}</td>
                    <td className="p-4 text-right text-emerald-600">{formatRupiah(data.masjid.income)}</td>
                    <td className="p-4 text-right text-red-600">{formatRupiah(data.masjid.expense)}</td>
                    <td className="p-4 text-right font-bold">{formatRupiah(data.masjid.balance)}</td>
                    <td className="p-4 text-right text-emerald-600">{formatRupiah(data.dusun.income)}</td>
                    <td className="p-4 text-right text-red-600">{formatRupiah(data.dusun.expense)}</td>
                    <td className="p-4 text-right font-bold">{formatRupiah(data.dusun.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
