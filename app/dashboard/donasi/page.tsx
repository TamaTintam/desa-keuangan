import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { formatRupiah } from "@/lib/utils"
import { HandHeart, Clock, CheckCircle2, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DonationList } from "@/components/features/donation-list"
import { DonationApprovalWrapper } from "@/components/features/donation-approval-wrapper"
import type { Donation } from "@/types"
import { redirect } from "next/navigation"

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
    return { 
      donations: [] as Donation[], 
      summary: { 
        total: 0, approved: 0, pending: 0, rejected: 0,
        masjid: 0, dusun: 0, masjidApproved: 0, dusunApproved: 0,
        count: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0 
      } 
    }
  }

  const donationData = donations || []
  const approvedDonations = donationData.filter((d: Donation) => d.status === 'APPROVED')
  const pendingDonations = donationData.filter((d: Donation) => d.status === 'PENDING')
  const rejectedDonations = donationData.filter((d: Donation) => d.status === 'REJECTED')

  return {
    donations: donationData as Donation[],
    summary: {
      total: donationData.reduce((sum: number, d: Donation) => sum + d.amount, 0),
      approved: approvedDonations.reduce((sum: number, d: Donation) => sum + d.amount, 0),
      pending: pendingDonations.reduce((sum: number, d: Donation) => sum + d.amount, 0),
      rejected: rejectedDonations.reduce((sum: number, d: Donation) => sum + d.amount, 0),
      masjidApproved: approvedDonations.filter((d: Donation) => d.category === 'MASJID').reduce((sum: number, d: Donation) => sum + d.amount, 0),
      dusunApproved: approvedDonations.filter((d: Donation) => d.category === 'DUSUN').reduce((sum: number, d: Donation) => sum + d.amount, 0),
      masjid: donationData.filter((d: Donation) => d.category === 'MASJID').reduce((sum: number, d: Donation) => sum + d.amount, 0),
      dusun: donationData.filter((d: Donation) => d.category === 'DUSUN').reduce((sum: number, d: Donation) => sum + d.amount, 0),
      count: donationData.length,
      approvedCount: approvedDonations.length,
      pendingCount: pendingDonations.length,
      rejectedCount: rejectedDonations.length,
    }
  }
}

export default async function DonasiPage() {
  const { donations, summary } = await getDonationsData()
  
  const approvedDonations = donations.filter(d => d.status === 'APPROVED')
  const pendingDonations = donations.filter(d => d.status === 'PENDING')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HandHeart className="h-7 w-7 text-blue-600" />
            Data Donasi
          </h1>
          <p className="text-gray-500 mt-1">Kelola dan pantau semua data donasi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 mb-1">Total Terkonfirmasi</p>
            <p className="text-2xl font-bold text-blue-700">{formatRupiah(summary.approved)}</p>
            <p className="text-xs text-blue-600 mt-1">{summary.approvedCount} donatur</p>
          </CardContent>
        </Card>
        
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <p className="text-sm text-emerald-600 mb-1">Dana Masjid</p>
            <p className="text-2xl font-bold text-emerald-700">{formatRupiah(summary.masjidApproved)}</p>
            <p className="text-xs text-emerald-600 mt-1">Terkonfirmasi</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 mb-1">Dana Dusun</p>
            <p className="text-2xl font-bold text-orange-700">{formatRupiah(summary.dusunApproved)}</p>
            <p className="text-xs text-orange-600 mt-1">Terkonfirmasi</p>
          </CardContent>
        </Card>

        <Card className={summary.pendingCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className={`text-sm ${summary.pendingCount > 0 ? 'text-yellow-600' : 'text-gray-600'}`}>Menunggu</p>
              {summary.pendingCount > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  {summary.pendingCount}
                </Badge>
              )}
            </div>
            <p className={`text-2xl font-bold ${summary.pendingCount > 0 ? 'text-yellow-700' : 'text-gray-700'}`}>
              {formatRupiah(summary.pending)}
            </p>
            <p className={`text-xs mt-1 ${summary.pendingCount > 0 ? 'text-yellow-600' : 'text-gray-500'}`}>
              Butuh konfirmasi
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <p className="text-sm text-purple-600 mb-1">Rata-rata</p>
            <p className="text-2xl font-bold text-purple-700">
              {formatRupiah(summary.approvedCount > 0 ? summary.approved / summary.approvedCount : 0)}
            </p>
            <p className="text-xs text-purple-600 mt-1">Per donatur</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Terkonfirmasi
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Menunggu
            {summary.pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {summary.pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <List className="h-4 w-4" />
            Semua
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Donasi Terkonfirmasi</CardTitle>
                <CardDescription>Donasi yang telah dikonfirmasi dan diterima</CardDescription>
              </div>
              <Badge variant="secondary">{summary.approvedCount} total</Badge>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
                <DonationList donations={approvedDonations} showPagination />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Menunggu Konfirmasi</CardTitle>
                <CardDescription>Donasi yang perlu ditinjau dan dikonfirmasi</CardDescription>
              </div>
              {summary.pendingCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {summary.pendingCount} pending
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {summary.pendingCount > 0 ? (
                <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
                  <DonationApprovalWrapper initialDonations={pendingDonations} />
                </Suspense>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-300" />
                  <p>Semua donasi sudah dikonfirmasi</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Tidak ada donasi yang menunggu konfirmasi
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Semua Donasi</CardTitle>
                <CardDescription>Semua data donasi termasuk yang ditolak</CardDescription>
              </div>
              <Badge variant="secondary">{summary.count} total</Badge>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
                <DonationList donations={donations} showPagination />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
