import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Banknote, HandHeart, Eye, TrendingUp, Play, Youtube, Newspaper } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { HeroSlider } from "@/components/features/hero-slider"
// import { NewsSlider } from "@/components/features/news-slider"

async function getHomeData() {
  const supabase = createClient()
  
  const [
    { data: settings },
    { data: news },
    { data: transactions },
    { data: donations }
  ] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase.from('news').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(6),
    supabase.from('transactions').select('*'),
    supabase.from('donations').select('*')
  ])

  const youtubeUrl = settings?.find(s => s.key === 'hero_youtube_url')?.value || ''
  const siteName = settings?.find(s => s.key === 'site_name')?.value || 'DesaKeuangan'

  // Calculate stats
  const totalDonations = donations?.reduce((sum, d) => sum + d.amount, 0) || 0
  const totalTransactions = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
  const sisaSaldo = totalDonations - totalTransactions
  const transactionCount = transactions?.length || 0

  return { youtubeUrl, siteName, news: news || [], totalDonations, totalTransactions, sisaSaldo, transactionCount }
}

export default async function HomePage() {
  const { youtubeUrl, siteName, news, totalDonations, totalTransactions, sisaSaldo,  transactionCount } = await getHomeData()

  return (
    <div className="flex flex-col">
      {/* Hero Section dengan Video */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                {siteName}
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Sistem manajemen keuangan terbuka untuk Masjid dan Dusun.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/transparansi">
                  <Button size="lg" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Lihat Laporan
                  </Button>
                </Link>
                <Link href="/donasi/masuk">
                  <Button variant="outline" size="lg" className="gap-2">
                    <HandHeart className="h-4 w-4" />
                    Berikan Donasi
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              {youtubeUrl ? (
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
                  <iframe
                    src={youtubeUrl}
                    title="Video Profil"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                  <div className="text-center text-green-800">
                    <TrendingUp className="h-20 w-20 mx-auto mb-4 opacity-60" />
                    <p className="text-lg font-medium">Sistem Keuangan Transparan</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* News Section - NEW! */}
      {news.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <HeroSlider news={news} />
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Banknote className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{transactionCount}</p>
              <p className="text-gray-600">Transaksi Tercatat</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HandHeart className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(sisaSaldo)}
              </p>
              <p className="text-gray-600">Total Saldo</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Newspaper className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{news.length}</p>
              <p className="text-gray-600">Berita Kegiatan</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Mari Berpartisipasi</h2>
          <p className="text-green-100 mb-8 text-lg">
            Donasi Anda akan membantu pembangunan dan kegiatan Masjid serta Dusun kita.
          </p>
          <Link href="/donasi/masuk">
            <Button size="lg" variant="secondary" className="gap-2">
              <HandHeart className="h-5 w-5" />
              Donasi Sekarang
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
