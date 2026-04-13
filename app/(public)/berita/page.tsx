import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, Plus, ImageIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Image from "next/image"

interface News {
  id: string
  slug: string
  title: string
  content: string
  images: string[]
  created_at: string
  is_published: boolean
  source_type?: string
}

export default async function BeritaPage() {
  const supabase = createClient()

  // Cek apakah user login (untuk tombol tambah)
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = !!user

  // Ambil semua berita yang published, urutkan terbaru dulu
  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching news:', error)
  }

  const newsList: News[] = news || []

  // Helper untuk cek dan bersihkan URL gambar
  const getValidImage = (item: News): string | null => {
    if (!item.images || !Array.isArray(item.images) || item.images.length === 0) {
      return null
    }

    for (const img of item.images) {
      if (typeof img === 'string' && img.trim() !== '') {
        let cleanUrl = img.trim()
        
        // Handle Google Images redirect
        if (cleanUrl.includes('google.com/imgres')) {
          try {
            const urlObj = new URL(cleanUrl)
            const actualUrl = urlObj.searchParams.get('imgurl')
            if (actualUrl) cleanUrl = decodeURIComponent(actualUrl)
          } catch {}
        }
        
        try {
          new URL(cleanUrl)
          return cleanUrl
        } catch {}
      }
    }
    return null
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Berita & Pengumuman
          </h1>
          <p className="text-gray-500 mt-1">
            Update terkini dari desa dan masjid
          </p>
        </div>
        
        {/* {isAdmin && (
          <Link href="/dashboard/berita">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Kelola Berita
            </Button>
          </Link>
        )} */}
      </div>

      {/* Grid Berita */}
      {newsList.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Belum ada berita
            </h3>
            <p className="text-gray-500">
              Nantikan update terbaru dari kami.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((item) => {
            const imageUrl = getValidImage(item)
            const excerpt = item.content?.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
            
            return (
              <Link key={item.id} href={`/berita/${item.slug}`}>
                <Card className="overflow-hidden group hover:shadow-lg transition-all h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized={!imageUrl.includes('supabase.co')}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-emerald-50 to-blue-50">
                        <ImageIcon className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Badge sumber */}
                    {item.source_type && item.source_type !== 'local' && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                        {item.source_type}
                      </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(item.created_at)}
                    </div>
                    
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                      {excerpt}
                    </p>
                    
                    <div className="flex items-center text-emerald-600 text-sm font-medium mt-auto group-hover:gap-2 transition-all">
                      Baca selengkapnya
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination atau Load More (optional) */}
      {newsList.length > 0 && (
        <div className="text-center text-sm text-gray-400 pt-4">
          Menampilkan {newsList.length} berita
        </div>
      )}
    </div>
  )
}
