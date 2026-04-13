import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, Share2, ImageIcon } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import Image from "next/image"

interface PageProps {
  params: { slug: string }
}

// Helper untuk cek URL valid
function isValidUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false
  if (url.trim() === '') return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Helper untuk cek perlu unoptimized
function needsUnoptimized(url: string): boolean {
  return !url.includes('supabase.co')
}

// Helper untuk filter gambar valid
function getValidImages(images: unknown): string[] {
  if (!Array.isArray(images)) return []
  return images.filter(isValidUrl)
}

export default async function NewsDetailPage({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!news) {
    notFound()
  }

  // Filter hanya gambar yang valid
  const validImages = getValidImages(news.images)
  const mainImage = validImages[0] || null
  const otherImages = validImages.slice(1)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" className="gap-2 pl-0">
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>
      </Link>

      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {news.title}
        </h1>
        <div className="flex items-center gap-4 mt-4 text-gray-500 flex-wrap">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(news.created_at)}
          </span>
          {validImages.length > 0 && (
            <span className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full">
              <ImageIcon className="h-4 w-4" />
              {validImages.length} foto
            </span>
          )}
          {news.source_type && news.source_type !== 'local' && (
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Sumber: {news.source_type}
            </span>
          )}
        </div>
      </div>

      {/* Main Image */}
      {mainImage ? (
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
            unoptimized={needsUnoptimized(mainImage)}
          />
        </div>
      ) : (
        // Fallback jika tidak ada gambar
        <div className="h-64 md:h-96 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
            <p>Tidak ada gambar</p>
          </div>
        </div>
      )}

      {/* Thumbnail Grid */}
      {otherImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {otherImages.map((img, idx) => (
            <div 
              key={idx} 
              className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Image
                src={img}
                alt={`${news.title} - ${idx + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 200px"
                unoptimized={needsUnoptimized(img)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <Card>
        <CardContent className="p-6 md:p-8">
          {news.content ? (
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          ) : (
            <p className="text-gray-500 italic">Tidak ada konten</p>
          )}
        </CardContent>
      </Card>

      {/* Source Link */}
      {news.source_url && isValidUrl(news.source_url) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800 mb-2">Sumber Berita:</p>
            <a 
              href={news.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-2 break-all"
            >
              {news.source_url}
              <Share2 className="h-4 w-4 flex-shrink-0" />
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
