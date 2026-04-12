import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { formatRupiah } from "@/lib/utils"
import { TransparencyContent } from "@/components/features/transparency-content"

async function getFinancialData() {
  const supabase = createClient()
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .order('date', { ascending: false })

  return {
    transactions: transactions || [],
    donations: donations || []
  }
}

export default async function TransparencyPage() {
  const { transactions, donations } = await getFinancialData()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan Dusun Polege</h1>
          <p className="mt-4 text-gray-600">
            Data keuangan transparan untuk Masjid dan Dusun
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Pantau pemasukan, pengeluaran, dan sisa saldo secara real-time
          </p>
        </div>

        <Suspense fallback={
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 animate-pulse rounded-xl" />
          </div>
        }>
          <TransparencyContent 
            transactions={transactions} 
            donations={donations} 
          />
        </Suspense>
      </div>
    </div>
  )
}
