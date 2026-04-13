import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TrendingUp, ArrowUpRight } from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import { FinancialChart } from "@/components/features/financial-chart"
import { BalanceCardWithDialog } from "@/components/features/balance-card-with-dialog"
import { VisitorAnalytics } from "@/components/features/visitor-stats"

// Helper untuk parse amount dengan aman
function safeAmount(val: any): number {
  if (val === null || val === undefined) return 0
  const num = Number(val)
  return isNaN(num) ? 0 : num
}

async function getDashboardData() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: news } = await supabase
    .from('news')
    .select('*')

  const txs = transactions || []
  const dons = donations || []

  // Calculate per entity dengan safe parsing
  const masjidIncome = txs
    .filter(t => t.category === 'MASJID' && t.type === 'INCOME')
    .reduce((sum, t) => sum + safeAmount(t.amount), 0)
  
  const masjidExpense = txs
    .filter(t => t.category === 'MASJID' && t.type === 'EXPENSE')
    .reduce((sum, t) => sum + safeAmount(t.amount), 0)

  const dusunIncome = txs
    .filter(t => t.category === 'DUSUN' && t.type === 'INCOME')
    .reduce((sum, t) => sum + safeAmount(t.amount), 0)
  
  const dusunExpense = txs
    .filter(t => t.category === 'DUSUN' && t.type === 'EXPENSE')
    .reduce((sum, t) => sum + safeAmount(t.amount), 0)

  // Detail per kategori untuk Masjid dan Dusun (PENGELUARAN saja)
  const bySubCategoryDetail = {
    INFAQ: { masjid: 0, dusun: 0 },
    SADAQAH: { masjid: 0, dusun: 0 },
    KEGIATAN: { masjid: 0, dusun: 0 },
    OPERASIONAL: { masjid: 0, dusun: 0 },
  }

  const bySubCategory = {
    INFAQ: { income: 0, expense: 0 },
    SADAQAH: { income: 0, expense: 0 },
    KEGIATAN: { income: 0, expense: 0 },
    OPERASIONAL: { income: 0, expense: 0 },
  }

  // Hitung semua transaksi
  txs.forEach(t => {
    const amount = safeAmount(t.amount)
    const cat = t.sub_category as keyof typeof bySubCategory
    if (!bySubCategory[cat]) return

    if (t.type === 'INCOME') {
      bySubCategory[cat].income += amount
    } else {
      bySubCategory[cat].expense += amount
      
      // Hitung pengeluaran per entity (Masjid/Dusun)
      if (t.category === 'MASJID') {
        bySubCategoryDetail[cat].masjid += amount
      } else if (t.category === 'DUSUN') {
        bySubCategoryDetail[cat].dusun += amount
      }
    }
  })

  const totalDonations = dons.reduce((sum, d) => sum + safeAmount(d.amount), 0)

  return {
    transactions: txs,
    donations: dons,
    newsCount: news?.length || 0,
    masjidBalance: masjidIncome - masjidExpense,
    dusunBalance: dusunIncome - dusunExpense,
    masjidIncome,
    masjidExpense,
    dusunIncome,
    dusunExpense,
    totalDonations,
    bySubCategory,
    bySubCategoryDetail,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  
  const {
    transactions,
    donations,
    newsCount,
    masjidBalance,
    dusunBalance,
    masjidIncome,
    masjidExpense,
    dusunIncome,
    dusunExpense,
    totalDonations,
    bySubCategory,
    bySubCategoryDetail,
  } = data

  // Validasi data sebelum render
  const safeMasjidBalance = typeof masjidBalance === 'number' && !isNaN(masjidBalance) ? masjidBalance : 0
  const safeDusunBalance = typeof dusunBalance === 'number' && !isNaN(dusunBalance) ? dusunBalance : 0
  const safeMasjidIncome = typeof masjidIncome === 'number' && !isNaN(masjidIncome) ? masjidIncome : 0
  const safeMasjidExpense = typeof masjidExpense === 'number' && !isNaN(masjidExpense) ? masjidExpense : 0
  const safeDusunIncome = typeof dusunIncome === 'number' && !isNaN(dusunIncome) ? dusunIncome : 0
  const safeDusunExpense = typeof dusunExpense === 'number' && !isNaN(dusunExpense) ? dusunExpense : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistik Keuangan</h1>
        <p className="text-gray-500 mt-1">Ringkasan keuangan dan aktivitas sistem</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BalanceCardWithDialog
          title="Saldo Masjid"
          balance={safeMasjidBalance}
          income={safeMasjidIncome}
          expense={safeMasjidExpense}
          type="masjid"
          donations={donations}
          transactions={transactions}
        />
        <BalanceCardWithDialog
          title="Saldo Dusun"
          balance={safeDusunBalance}
          income={safeDusunIncome}
          expense={safeDusunExpense}
          type="dusun"
          donations={donations}
          transactions={transactions}
        />
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-100">Total Donasi</CardDescription>
            <CardTitle className="text-3xl">{formatRupiah(totalDonations)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-purple-100">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>{donations.length} donatur</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-100">Jumlah Berita</CardDescription>
            <CardTitle className="text-3xl">{newsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-orange-100">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>{transactions.length} transaksi</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Chart with Detail Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Pengeluaran per Kategori</CardTitle>
              <CardDescription>
                Perbandingan pengeluaran Masjid (Hijau) vs Dusun (Merah)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialChart 
                bySubCategory={bySubCategory} 
                bySubCategoryDetail={bySubCategoryDetail}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <VisitorAnalytics />
        </div>
      </div>
    </div>
  )
}
