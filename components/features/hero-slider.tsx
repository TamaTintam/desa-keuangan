"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
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
}

export function HeroSlider() {
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
        .limit(5)

      if (error) throw error
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
    }, 5000)

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

  // Helper untuk cek dan dapatkan gambar valid
  const getValidImage = (item: News): string | null => {
    if (!item.images || !Array.isArray(item.images) || item.images.length === 0) {
      return null
    }

    // Ambil gambar pertama yang valid
    for (const img of item.images) {
      if (typeof img === 'string' && img.trim() !== '') {
        // Cek apakah URL valid
        try {
          new URL(img)
          return img
        } catch {
          // Bukan URL valid, skip
          continue
        }
      }
    }
    return null
  }

  // Helper untuk cek apakah perlu unoptimized
  const needsUnoptimized = (url: string): boolean => {
    // Supabase storage bisa di-optimize
    if (url.includes('supabase.co')) {
      return false
    }
    // URL eksternal perlu unoptimized
    return true
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
  const currentImage = getValidImage(currentNews)

  return (
    <div className="relative">
      {/* Main Slider */}
      <Card className="relative overflow-hidden rounded-xl h-[400px] md:h-[500px]">
        {/* Background Image dengan Fallback */}
        <div className="absolute inset-0 bg-gray-900">
          {currentImage ? (
            <div className="relative w-full h-full">
              <Image
                src={currentImage}
                alt={currentNews.title}
                fill
                className="object-cover opacity-60"
                sizes="100vw"
                priority={currentSlide === 0}
                unoptimized={needsUnoptimized(currentImage)}
                onError={(e) => {
                  // Jika error, tampilkan fallback
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          ) : (
            // Fallback gradient background
            <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800" />
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3 text-sm text-white/80">
              <Calendar className="h-4 w-4" />
              {formatDate(currentNews.created_at)}
              {/* Indicator jika ada multiple images */}
              {currentNews.images && currentNews.images.length > 1 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {currentNews.images.length} foto
                </span>
              )}
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold mb-4 line-clamp-2 md:line-clamp-3">
              {currentNews.title}
            </h2>
            
            <p className="text-white/80 line-clamp-2 mb-6 text-sm md:text-base">
              {currentNews.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
            
            <Link href={`/berita/${currentNews.slug}`}>
              <Button className="bg-white text-emerald-900 hover:bg-white/90">
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
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </Card>

      {/* Dots Indicator */}
      {news.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {news.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-emerald-600 w-6' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
