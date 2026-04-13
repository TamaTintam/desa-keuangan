import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, ImageIcon } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import Image from "next/image"

interface PageProps {
  params: { slug: string }
}

function cleanImageUrl(url: string): string {
  let cleanUrl = url.trim()
  if (cleanUrl.includes("google.com/imgres")) {
    try {
      const urlObj = new URL(cleanUrl)
      const actualUrl = urlObj.searchParams.get("imgurl")
      if (actualUrl) cleanUrl = decodeURIComponent(actualUrl)
    } catch {}
  }
  return cleanUrl
}

function isValidUrl(url: unknown): url is string {
  if (typeof url !== "string") return false
  if (url.trim() === "") return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const supabase = createClient()

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single()

  if (!news) {
    notFound()
  }

  const validImages = (news.images || [])
    .filter(isValidUrl)
    .map(cleanImageUrl)

  const mainImage = validImages[0] || null
  const otherImages = validImages.slice(1)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <Link href="/berita">
        <Button variant="ghost" className="gap-2 pl-0">
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {news.title}
        </h1>
        <div className="flex items-center gap-4 mt-4 text-gray-500">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(news.created_at)}
          </span>
        </div>
      </div>

      {mainImage ? (
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
            unoptimized={!mainImage.includes("supabase.co")}
          />
        </div>
      ) : (
        <div className="h-64 md:h-96 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-gray-400" />
        </div>
      )}

      {otherImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {otherImages.map((img, idx) => (
            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={img}
                alt={`${news.title} - ${idx + 2}`}
                fill
                className="object-cover"
                sizes="200px"
                unoptimized={!img.includes("supabase.co")}
              />
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-6 md:p-8">
          {news.content ? (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          ) : (
            <p className="text-gray-500 italic">Tidak ada konten</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
// ```__
