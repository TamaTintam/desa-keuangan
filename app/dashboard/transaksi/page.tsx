import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionList } from "@/components/features/transaction-list"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { redirect } from "next/navigation"

export default async function TransaksiPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Transaksi</h1>
        <Link href="/dashboard/transaksi/tambah">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Transaksi
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList 
            transactions={transactions || []} 
            showActions 
            showPagination
          />
        </CardContent>
      </Card>
    </div>
  )
}
