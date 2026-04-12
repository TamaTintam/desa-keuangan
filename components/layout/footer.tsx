import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Sistem Informasi Polege</h3>
            <p className="text-sm text-gray-400">
              Sistem manajemen keuangan desa yang transparan untuk kepentingan 
              masjid dan dusun. Warga dapat memantau pemasukan dan pengeluaran kapan saja.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Menu Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/transparansi" className="hover:text-white transition-colors">
                  Laporan Keuangan
                </Link>
              </li>
              <li>
                <Link href="/donasi/masuk" className="hover:text-white transition-colors">
                  Berdonasi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Kontak</h3>
            <p className="text-sm text-gray-400">
              Desa [Lembasada]<br />
              Kecamatan [Banawa Selatan]<br />
              Kabupaten [Donggala]<br />
              Email: info@desa.co.id
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} TamsProjects. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  )
}
