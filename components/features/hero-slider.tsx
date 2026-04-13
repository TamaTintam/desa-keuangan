"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface News {
  id: string
  slug: string
  title: string
  content: string
  images: string[]
  created_at: string
}

export function HeroSlider() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})

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
        .limit(5)

      if (error) throw error
      console.log('Slide data:', data)
      setNews(data || [])
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-slide
  useEffect(() => {
    if (news.length <= 1) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % news.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [news.length])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % news.length)
  }, [news.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + news.length) % news.length)
  }, [news.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // ✅ HELPER: Bersihkan URL gambar (handle Google Images redirect)
  const cleanImageUrl = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null
    
    let cleanUrl = url.trim()
    
    // Handle Google Images redirect URLs
    if (cleanUrl.includes('google.com/imgres')) {
      try {
        const urlObj = new URL(cleanUrl)
        const actualUrl = urlObj.searchParams.get('imgurl')
        if (actualUrl) {
          cleanUrl = decodeURIComponent(actualUrl)
        }
      } catch (e) {
        console.log('Failed to parse Google URL:', cleanUrl)
      }
    }
    
    // Validasi URL
    try {
      new URL(cleanUrl)
      return cleanUrl
    } catch {
      return null
    }
  }

  // ✅ HELPER: Dapatkan gambar pertama yang valid
  const getSlideImage = (item: News): string | null => {
    if (!item.images || !Array.isArray(item.images)) return null
    
    for (const img of item.images) {
      const clean = cleanImageUrl(img)
      if (clean) return clean
    }
    return null
  }

  const handleImageLoad = (url: string) => {
    setLoadedImages(prev => ({ ...prev, [url]: true }))
  }

  const handleImageError = (url: string) => {
    console.error('Image failed to load:', url)
    setLoadedImages(prev => ({ ...prev, [url]: false }))
  }

  if (loading) {
    return (
      <div className="relative h-[400px] md:h-[500px] bg-gray-200 animate-pulse rounded-xl" />
    )
  }

  if (news.length === 0) {
    return (
      <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
        <p className="text-emerald-800 text-lg">Belum ada berita</p>
      </div>
    )
  }

  const currentNews = news[currentSlide]
  const slideImage = getSlideImage(currentNews)

  return (
    <div className="relative">
      {/* Main Slider */}
      <Card className="relative overflow-hidden rounded-xl h-[400px] md:h-[500px]">
        
        {/* ✅ CARA 1: Gunakan img tag biasa untuk semua URL eksternal */}
        <div className="absolute inset-0">
          {slideImage ? (
            <>
              {/* Placeholder loading */}
              {!loadedImages[slideImage] && (
                <div className="absolute inset-0 bg-gray-300 animate-pulse" />
              )}
              
              {/* Gambar actual dengan img tag */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={slideImage}
                src={slideImage}
                alt={currentNews.title}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  loadedImages[slideImage] ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => handleImageLoad(slideImage)}
                onError={() => handleImageError(slideImage)}
              />
              
              {/* Overlay dark */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </>
          ) : (
            // Fallback gradient
            <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800" />
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3 text-sm text-white/80">
              <Calendar className="h-4 w-4" />
              {formatDate(currentNews.created_at)}
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold mb-4 line-clamp-2 md:line-clamp-3 leading-tight">
              {currentNews.title}
            </h2>
            
            <p className="text-white/80 line-clamp-2 mb-6 text-sm md:text-base">
              {currentNews.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
            
            <Link href={`/berita/${currentNews.slug}`}>
              <Button className="bg-white text-emerald-900 hover:bg-white/90 font-semibold">
                Baca Selengkapnya
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Arrows */}
        {news.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors z-20"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors z-20"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </Card>

      {/* Dots Indicator */}
      {news.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {news.map((item, index) => {
            const img = getSlideImage(item)
            return (
              <button
                key={item.id}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-emerald-600 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                }`}
                title={item.title}
              />
            )
          })}
        </div>
      )}

      {/* Debug: Show image URL (hapus setelah testing) */}
      {slideImage && (
        <div className="mt-2 text-xs text-gray-400 truncate hidden">
          Image: {slideImage}
        </div>
      )}
    </div>
  )
}
