"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NewsForm } from "./news-form"
import { createClient } from "@/lib/supabase/client"
// import { toast } from "sonner"
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface News {
  id: string
  title: string
  content: string
  images: string[]
  is_published: boolean
  source_url?: string
  source_type?: 'local' | 'facebook' | 'instagram' | 'twitter' | 'other'
  created_at: string
}

interface NewsManagerProps {
  initialNews: News[]
}

export function NewsManager({ initialNews }: NewsManagerProps) {
  const [news, setNews] = useState<News[]>(initialNews)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()

  // Helper untuk generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter spesial
    .replace(/\s+/g, '-')         // Spasi jadi dash
    .substring(0, 100)            // Batasi panjang
}

  const handleSubmit = async (data: any) => {
    try {
      // Generate slug dari title
      const slug = generateSlug(data.title)
      
      if (data.id) {
        // Update existing
        const { error } = await supabase
          .from('news')
          .update({
            title: data.title,
            slug: slug, // <-- TAMBAH INI
            content: data.content,
            images: data.images,
            is_published: data.is_published,
            source_url: data.source_url,
            source_type: data.source_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)

        if (error) throw error
        
        alert('Berita berhasil diperbarui')
        setNews(prev => prev.map(n => n.id === data.id ? { ...n, ...data, slug } : n))
      } else {
        // Create new
        const { data: newNews, error } = await supabase
          .from('news')
          .insert({
            title: data.title,
            slug: slug, // <-- TAMBAH INI
            content: data.content,
            images: data.images,
            is_published: data.is_published,
            source_url: data.source_url,
            source_type: data.source_type
          })
          .select()
          .single()

        if (error) throw error
        
        alert('Berita berhasil ditambahkan')
        setNews(prev => [newNews, ...prev])
      }

      setIsDialogOpen(false)
      setEditingNews(null)
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus berita ini?')) return

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('Berita dihapus')
      setNews(prev => prev.filter(n => n.id !== id))
    } catch (error: any) {
      alert(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublish = async (item: News) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ is_published: !item.is_published })
        .eq('id', item.id)

      if (error) throw error

      setNews(prev => prev.map(n => 
        n.id === item.id ? { ...n, is_published: !n.is_published } : n
      ))
      
      alert(item.is_published ? 'Berita disembunyikan' : 'Berita dipublikasikan')
    } catch (error: any) {
      alert(error.message)
    }
  }

  const getSourceIcon = (type?: string) => {
    switch (type) {
      case 'facebook': return 'Facebook'
      case 'instagram': return 'Instagram'
      case 'twitter': return 'Twitter'
      default: return 'Website'
    }
  }

  const getSourceColor = (type?: string) => {
    switch (type) {
      case 'facebook': return 'bg-blue-100 text-blue-800'
      case 'instagram': return 'bg-pink-100 text-pink-800'
      case 'twitter': return 'bg-gray-100 text-gray-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-500">
          Total {news.length} berita
        </p>
        <Button 
          onClick={() => {
            setEditingNews(null)
            setIsDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Berita
        </Button>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <Card key={item.id} className={`overflow-hidden ${!item.is_published ? 'opacity-75' : ''}`}>
            {/* Thumbnail */}
            <div className="relative h-48 bg-gray-100">
              {item.images && item.images.length > 0 ? (
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Tidak ada gambar
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge className={item.is_published ? 'bg-green-500' : 'bg-gray-500'}>
                  {item.is_published ? 'Publik' : 'Draft'}
                </Badge>
                {item.source_type && item.source_type !== 'local' && (
                  <Badge className={getSourceColor(item.source_type)}>
                    {getSourceIcon(item.source_type)}
                  </Badge>
                )}
              </div>

              {/* Image count */}
              {item.images && item.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  +{item.images.length - 1} foto
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {formatDate(item.created_at)}
              </p>
              
              {item.source_url && (
                <a 
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3"
                >
                  <ExternalLink className="h-3 w-3" />
                  Lihat sumber
                </a>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePublish(item)}
                >
                  {item.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingNews(item)
                    setIsDialogOpen(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {deletingId === item.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Belum ada berita. Klik "Tambah Berita" untuk membuat.
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNews ? 'Edit Berita' : 'Tambah Berita Baru'}
            </DialogTitle>
          </DialogHeader>
          
          <NewsForm
            initialData={editingNews ? {
              id: editingNews.id,
              title: editingNews.title,
              content: editingNews.content,
              images: editingNews.images,
              is_published: editingNews.is_published,
              source_url: editingNews.source_url,
              source_type: editingNews.source_type
            } : undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false)
              setEditingNews(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
