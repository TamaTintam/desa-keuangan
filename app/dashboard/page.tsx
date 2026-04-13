import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { formatRupiah } from "@/lib/utils"
import { BalanceCard } from "@/components/features/balance-card"
import { FinancialChart } from "@/components/features/financial-chart"
import { TransactionList } from "@/components/features/transaction-list"
import { DonationList } from "@/components/features/donation-list"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Wallet, Building2, Home, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { redirect } from "next/navigation"

async function getDashboardData() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get all transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  // Get all donations
  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })

  // Calculate Masjid totals
  const masjidTrans = transactions?.filter(t => t.category === 'MASJID') || []
  const masjidDons = donations?.filter(d => d.category === 'MASJID') || []
  
  const masjidIncome = masjidTrans
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0) +
    masjidDons.reduce((sum, d) => sum + d.amount, 0)
  
  const masjidExpense = masjidTrans
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate Dusun totals
  const dusunTrans = transactions?.filter(t => t.category === 'DUSUN') || []
  const dusunDons = donations?.filter(d => d.category === 'DUSUN') || []
  
  const dusunIncome = dusunTrans
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0) +
    dusunDons.reduce((sum, d) => sum + d.amount, 0)
  
  const dusunExpense = dusunTrans
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate by subcategory detail for chart
  const subCategories = ['INFAQ', 'SADAQAH', 'KEGIATAN', 'OPERASIONAL'] as const
  
  const bySubCategory = Object.fromEntries(
    subCategories.map(sub => {
      const subTrans = transactions?.filter(t => t.sub_category === sub) || []
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

  const bySubCategoryDetail = Object.fromEntries(
    subCategories.map(sub => {
      const subTrans = transactions?.filter(t => 
        t.sub_category === sub && t.type === 'EXPENSE'
      ) || []
      
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

  return {
    summary: {
      masjid: {
        income: masjidIncome,
        expense: masjidExpense,
        balance: masjidIncome - masjidExpense,
      },
      dusun: {
        income: dusunIncome,
        expense: dusunExpense,
        balance: dusunIncome - dusunExpense,
      },
      total: {
        income: masjidIncome + dusunIncome,
        expense: masjidExpense + dusunExpense,
        balance: (masjidIncome + dusunIncome) - (masjidExpense + dusunExpense),
      }
    },
    bySubCategory,
    bySubCategoryDetail,
    transactions: transactions?.slice(0, 10) || [],
    donations: donations?.slice(0, 10) || [],
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Kelola dan pantau keuangan desa</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/transaksi/tambah">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Transaksi Baru
            </Button>
          </Link>
          <Link href="/dashboard/laporan">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Laporan
            </Button>
          </Link>
        </div>
      </div>

      {/* Ringkasan Keuangan - Tanpa Tombol Detail */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" />
          Ringkasan Keuangan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Saldo */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Total Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 mb-2">
                {formatRupiah(data.summary.total.balance)}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <ArrowUpCircle className="h-3 w-3 text-emerald-500" />
                    Pemasukan
                  </span>
                  <span className="font-medium text-emerald-600">+{formatRupiah(data.summary.total.income)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <ArrowDownCircle className="h-3 w-3 text-red-500" />
                    Pengeluaran
                  </span>
                  <span className="font-medium text-red-600">-{formatRupiah(data.summary.total.expense)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saldo Masjid */}
          <Card className="border-2 border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Sisa Dana Masjid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700 mb-2">
                {formatRupiah(data.summary.masjid.balance)}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Pemasukan</span>
                  <span className="font-medium text-emerald-600">+{formatRupiah(data.summary.masjid.income)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Pengeluaran</span>
                  <span className="font-medium text-red-600">-{formatRupiah(data.summary.masjid.expense)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saldo Dusun */}
          <Card className="border-2 border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Sisa Dana Dusun
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 mb-2">
                {formatRupiah(data.summary.dusun.balance)}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Pemasukan</span>
                  <span className="font-medium text-emerald-600">+{formatRupiah(data.summary.dusun.income)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Pengeluaran</span>
                  <span className="font-medium text-red-600">-{formatRupiah(data.summary.dusun.expense)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grafik */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Grafik Pengeluaran per Kategori</CardTitle>
          <CardDescription>Perbandingan pengeluaran Masjid vs Dusun</CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialChart 
            bySubCategory={data.bySubCategory} 
            bySubCategoryDetail={data.bySubCategoryDetail}
          />
        </CardContent>
      </Card> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transaksi Terbaru</CardTitle>
              <CardDescription>10 transaksi terakhir</CardDescription>
            </div>
            <Link href="/dashboard/transaksi">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <TransactionList transactions={data.transactions} showActions showSubCategory />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Donasi Terbaru</CardTitle>
              <CardDescription>10 donasi terakhir</CardDescription>
            </div>
            <Link href="/dashboard/donasi">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <DonationList donations={data.donations} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}