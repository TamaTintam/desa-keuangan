import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NewsManager } from "@/components/features/news-manager"

export default async function BeritaPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Ambil semua berita
  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching news:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Berita</h1>
        <p className="text-gray-500 mt-1">
          Kelola berita dan pengumuman desa/masjid
        </p>
      </div>

      <NewsManager initialNews={news || []} />
    </div>
  )
}
