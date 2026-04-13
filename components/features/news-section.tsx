"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
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
}

export function NewsSection() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error
      setNews(data || [])
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper untuk cek valid URL
  const isValidUrl = (url: string) => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Helper untuk dapatkan thumbnail
  const getThumbnail = (item: News) => {
    if (item.images && item.images.length > 0 && isValidUrl(item.images[0])) {
      return item.images[0]
    }
    return null
  }

  const featuredNews = news[0]
  const otherNews = news.slice(1, 4)

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (news.length === 0) {
    return null
  }

  return (
    <section className="py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Berita Terkini</h2>
          <p className="text-gray-500 mt-1">Update informasi desa dan masjid</p>
        </div>
        <Link href="/berita">
          <Button variant="outline" className="gap-2">
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Featured News (Large) */}
      {featuredNews && (
        <Card className="overflow-hidden group">
          <Link href={`/berita/${featuredNews.slug}`}>
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Container - Full height */}
              <div className="relative h-64 md:h-96 bg-gray-100 overflow-hidden">
                {getThumbnail(featuredNews) ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={getThumbnail(featuredNews)!}
                      alt={featuredNews.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized={!getThumbnail(featuredNews)?.includes('supabase')} // Unoptimized untuk external URLs
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-emerald-100 to-emerald-200">
                    <span className="text-emerald-600 text-lg">Tidak ada gambar</span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4" />
                  {formatDate(featuredNews.created_at)}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 line-clamp-3">
                  {featuredNews.title}
                </h3>
                <p className="text-gray-600 line-clamp-4 mb-6">
                  {featuredNews.content?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </p>
                <Button className="w-fit gap-2">
                  Baca Selengkapnya
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Link>
        </Card>
      )}

      {/* Other News Grid */}
      {otherNews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherNews.map((item) => (
            <NewsCard key={item.id} news={item} getThumbnail={getThumbnail} />
          ))}
        </div>
      )}
    </section>
  )
}

// Komponen Card Berita
function NewsCard({ 
  news, 
  getThumbnail 
}: { 
  news: News
  getThumbnail: (item: News) => string | null 
}) {
  const thumbnail = getThumbnail(news)
  
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <Link href={`/berita/${news.slug}`}>
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {thumbnail ? (
            <div className="relative w-full h-full">
              <Image
                src={thumbnail}
                alt={news.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized={!thumbnail.includes('supabase')}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-gray-400">Tidak ada gambar</span>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Calendar className="h-3 w-3" />
            {formatDate(news.created_at)}
          </div>
          <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {news.title}
          </h4>
        </CardContent>
      </Link>
    </Card>
  )
}
