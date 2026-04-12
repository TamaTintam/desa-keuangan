import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { formatRupiah } from "@/lib/utils"
import { DonationList } from "@/components/features/donation-list"
import { redirect } from "next/navigation"
import { HandHeart, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

async function getDonationsData() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: donations, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching donations:', error)
    return { donations: [], summary: { total: 0, masjid: 0, dusun: 0, count: 0 } }
  }

  const masjidDonations = donations?.filter(d => d.category === 'MASJID') || []
  const dusunDonations = donations?.filter(d => d.category === 'DUSUN') || []

  return {
    donations: donations || [],
    summary: {
      total: donations?.reduce((sum, d) => sum + d.amount, 0) || 0,
      masjid: masjidDonations.reduce((sum, d) => sum + d.amount, 0),
      dusun: dusunDonations.reduce((sum, d) => sum + d.amount, 0),
      count: donations?.length || 0,
      masjidCount: masjidDonations.length,
      dusunCount: dusunDonations.length,
    }
  }
}

export default async function DonasiPage() {
  const { donations, summary } = await getDonationsData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <HandHeart className="h-8 w-8 text-blue-600" />
            Data Donasi
          </h1>
          <p className="text-gray-500 mt-1">Kelola dan pantau semua data donasi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 mb-1">Total Donasi</p>
            <p className="text-2xl font-bold text-blue-700">{formatRupiah(summary.total)}</p>
            <p className="text-xs text-blue-600 mt-1">{summary.count} donatur</p>
          </CardContent>
        </Card>
        
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <p className="text-sm text-emerald-600 mb-1">Donasi Masjid</p>
            <p className="text-2xl font-bold text-emerald-700">{formatRupiah(summary.masjid)}</p>
            <p className="text-xs text-emerald-600 mt-1">{summary.masjidCount} donatur</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 mb-1">Donasi Dusun</p>
            <p className="text-2xl font-bold text-orange-700">{formatRupiah(summary.dusun)}</p>
            <p className="text-xs text-orange-600 mt-1">{summary.dusunCount} donatur</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <p className="text-sm text-purple-600 mb-1">Rata-rata Donasi</p>
            <p className="text-2xl font-bold text-purple-700">
              {formatRupiah(summary.count > 0 ? summary.total / summary.count : 0)}
            </p>
            <p className="text-xs text-purple-600 mt-1">per donatur</p>
          </CardContent>
        </Card>
      </div>

      {/* Donations List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Donasi</CardTitle>
            <CardDescription>Semua data donasi yang telah tercatat</CardDescription>
          </div>
          <Badge variant="secondary">{summary.count} total</Badge>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
            <DonationList donations={donations} showPagination />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
