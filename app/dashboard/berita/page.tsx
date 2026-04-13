import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NewsManager } from "@/components/features/news-manager"

export default async function DashboardBeritaPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Berita</h1>
      <NewsManager initialNews={news || []} />
    </div>
  )
}
