'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Calendar, Image as ImageIcon, ArrowRight } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import type { NewsItem } from "@/types"

interface NewsSliderProps {
  news: NewsItem[]
  showAllButton?: boolean
  maxItems?: number
}

export function NewsSlider({ news, showAllButton = true, maxItems = 5 }: NewsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Limit news to maxItems
  const visibleNews = news.filter(n => n.is_published).slice(0, maxItems)
  
  useEffect(() => {
    if (visibleNews.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleNews.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [visibleNews.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % visibleNews.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + visibleNews.length) % visibleNews.length)
  }

  const openNewsDetail = (newsItem: NewsItem) => {
    setSelectedNews(newsItem)
    setSelectedImageIndex(0)
  }

  if (visibleNews.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Berita & Kegiatan Masjid</h2>
          <p className="text-gray-500 text-sm mt-1">
            Informasi terbaru seputar kegiatan Masjid dan Dusun
          </p>
        </div>
        <div className="flex items-center gap-3">
          {visibleNews.length > 1 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={prevSlide}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextSlide}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {showAllButton && (
            <Link href="/berita">
              <Button variant="ghost" size="sm" className="gap-1">
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Slider */}
      <div className="relative overflow-hidden rounded-xl bg-gray-100">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {visibleNews.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0">
              <Card className="border-0 overflow-hidden cursor-pointer group" onClick={() => openNewsDetail(item)}>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-video md:aspect-auto md:h-80 bg-gray-200">
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-16 w-16" />
                      </div>
                    )}
                    {item.images && item.images.length > 1 && (
                      <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" />
                        {item.images.length} foto
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col justify-center">
                    <Badge className="w-fit mb-3">{item.category}</Badge>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {item.excerpt || item.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(item.published_at || item.created_at)}
                    </div>
                    <Button variant="outline" className="w-fit">
                      Baca Selengkapnya
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {visibleNews.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {visibleNews.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {visibleNews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {visibleNews.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {visibleNews.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-video rounded-lg overflow-hidden ${
                index === currentIndex ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedNews.title}</DialogTitle>
              </DialogHeader>
              
              {selectedNews.images && selectedNews.images.length > 0 && (
                <div className="space-y-4 mb-6">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={selectedNews.images[selectedImageIndex]} 
                      alt={selectedNews.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {selectedNews.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedNews.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                            idx === selectedImageIndex ? 'ring-2 ring-blue-500' : 'opacity-70'
                          }`}
                        >
                          <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge>{selectedNews.category}</Badge>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedNews.published_at || selectedNews.created_at)}
                  </span>
                </div>
                
                {selectedNews.excerpt && (
                  <p className="text-lg text-gray-600 italic border-l-4 border-blue-500 pl-4">
                    {selectedNews.excerpt}
                  </p>
                )}
                
                <div className="prose max-w-none">
                  {selectedNews.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
