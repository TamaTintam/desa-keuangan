import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Banknote, HandHeart, Eye, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Transparansi Keuangan Dusun Polege
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Sistem manajemen keuangan terbuka untuk Masjid dan Dusun. 
            Lihat pemasukan dan pengeluaran secara real-time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/transparansi">
              <Button size="lg" className="gap-2">
                <Eye className="h-4 w-4" />
                Lihat Laporan
              </Button>
            </Link>
            <Link href="/donasi/masuk">
              <Button variant="outline" size="lg">
                Berikan Donasi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Fitur Utama</h2>
            <p className="mt-4 text-gray-600">Kelola dan pantau keuangan dengan mudah</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Banknote className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Dual Kategori</CardTitle>
                <CardDescription>
                  Pisahkan keuangan Masjid dan Dusun untuk transparansi lebih baik
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Setiap transaksi dikelompokkan berdasarkan Masjid atau Dusun, 
                  memudahkan pelacakan arus kas masing-masing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <HandHeart className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Donasi Online</CardTitle>
                <CardDescription>
                  Masyarakat dapat berdonasi untuk Masjid atau Dusun
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Sistem pencatatan donasi otomatis dengan nomor resi untuk 
                  keamanan dan transparansi.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Laporan Real-time</CardTitle>
                <CardDescription>
                  Pantau keuangan kapan saja, di mana saja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Grafik dan laporan terupdate otomatis untuk transparansi 
                  penuh kepada seluruh warga.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-green-600">2</div>
              <div className="text-sm text-gray-600 mt-1">Kategori Keuangan</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600 mt-1">Transparansi</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-purple-600">Real-time</div>
              <div className="text-sm text-gray-600 mt-1">Update Data</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-orange-600">Aman</div>
              <div className="text-sm text-gray-600 mt-1">Tersertifikasi</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
