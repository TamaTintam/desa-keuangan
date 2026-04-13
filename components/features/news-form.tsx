"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Globe,
  Facebook,
  Instagram,
  ExternalLink,
  Trash2,
  Plus
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
// import { toast } from "sonner"
import Image from "next/image"

interface NewsFormProps {
  initialData?: {
    id?: string
    title: string
    content: string
    images: string[]
    is_published: boolean
    source_url?: string
    source_type?: 'local' | 'facebook' | 'instagram' | 'twitter' | 'other'
  }
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function NewsForm({ initialData, onSubmit, onCancel }: NewsFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? true)
  const [sourceUrl, setSourceUrl] = useState(initialData?.source_url || "")
  const [sourceType, setSourceType] = useState(initialData?.source_type || 'local')
  
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [activeTab, setActiveTab] = useState<"manual" | "import">("manual")
  const [importUrl, setImportUrl] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Upload gambar ke Supabase Storage
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      for (const file of Array.from(files)) {
        // Validasi file
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} bukan file gambar`)
          continue
        }
        
        if (file.size > 5 * 1024 * 1024) { // Max 5MB
          alert(`${file.name} terlalu besar (max 5MB)`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `news/${fileName}`

        // Upload ke Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('news-images')
          .upload(filePath, file)

        if (uploadError) {
          alert(`Gagal upload: ${uploadError.message} ${file.name}`)
          continue
        }

        // Dapatkan public URL
        const { data: { publicUrl } } = supabase.storage
          .from('news-images')
          .getPublicUrl(filePath)

        setImages(prev => [...prev, publicUrl])
        alert(`Berhasil upload ${file.name}`)
      }
    } catch (error) {
      alert('Terjadi kesalahan saat upload')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Hapus gambar
  const removeImage = async (imageUrl: string, index: number) => {
    try {
      // Extract path from URL
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/')
      const filePath = pathParts.slice(pathParts.indexOf('news-images') + 1).join('/')

      // Hapus dari storage
      await supabase.storage
        .from('news-images')
        .remove([filePath])

      setImages(prev => prev.filter((_, i) => i !== index))
      alert('Gambar dihapus')
    } catch (error) {
      // Jika gagal hapus dari storage, tetap hapus dari state
      setImages(prev => prev.filter((_, i) => i !== index))
    }
  }

  // Import berita dari URL eksternal
  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      alert('Masukkan URL berita')
      return
    }

    setImporting(true)
    
    try {
      // Detect source type
      let detectedSource: 'facebook' | 'instagram' | 'twitter' | 'other' = 'other'
      if (importUrl.includes('facebook.com') || importUrl.includes('fb.com')) {
        detectedSource = 'facebook'
      } else if (importUrl.includes('instagram.com')) {
        detectedSource = 'instagram'
      } else if (importUrl.includes('twitter.com') || importUrl.includes('x.com')) {
        detectedSource = 'twitter'
      }

      // Panggil API untuk scrape metadata
      const response = await fetch('/api/scrape-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      })

      if (!response.ok) {
        throw new Error('Gagal mengambil data dari URL')
      }

      const data = await response.json()

      // Isi form dengan data yang di-scrape
      setTitle(data.title || '')
      setContent(data.description || data.content || '')
      setSourceUrl(importUrl)
      setSourceType(detectedSource)
      
      if (data.image) {
        setImages([data.image])
      }

      alert('Berita berhasil diimpor!')
      setActiveTab('manual') // Switch ke tab manual untuk review/edit
      
    } catch (error) {
      alert('Gagal mengimpor berita. Pastikan URL valid.')
    } finally {
      setImporting(false)
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('Judul berita wajib diisi')
      return
    }

    await onSubmit({
      id: initialData?.id,
      title,
      content,
      images,
      is_published: isPublished,
      source_url: sourceUrl || null,
      source_type: sourceType,
    })
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'facebook': return <Facebook className="h-4 w-4" />
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'twitter': return <Globe className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "manual" | "import")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Manual
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Impor dari Link
          </TabsTrigger>
        </TabsList>

        {/* Tab Import */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Impor Berita dari Media Sosial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Masukkan URL Berita</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://facebook.com/... atau https://instagram.com/..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                  />
                  <Button 
                    type="button"
                    onClick={handleImportFromUrl}
                    disabled={importing}
                  >
                    {importing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Impor'
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Support: Facebook, Instagram, Twitter/X, dan website lain
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-blue-50">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-pink-50">
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <span className="text-sm">Instagram</span>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <span className="text-sm">Twitter/X</span>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50">
                  <Globe className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Website</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Manual */}
        <TabsContent value="manual" className="space-y-6">
          {/* Judul */}
          <div className="space-y-2">
            <Label htmlFor="title">Judul Berita *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul berita"
              className="text-lg"
            />
          </div>

          {/* Sumber (jika dari import) */}
          {sourceUrl && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              {getSourceIcon(sourceType)}
              <span className="text-sm text-blue-800">Sumber: </span>
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate flex-1"
              >
                {sourceUrl}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSourceUrl('')
                  setSourceType('local')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Upload Gambar */}
          <div className="space-y-2">
            <Label>Galeri Foto</Label>
            
            {/* Preview Gambar */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group aspect-square">
                    <Image
                      src={img}
                      alt={`Gambar ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img, index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2 bg-black/70">
                        Utama
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Buttons */}
            <div className="flex flex-wrap gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload dari Device
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const url = prompt('Masukkan URL gambar:')
                  if (url) setImages(prev => [...prev, url])
                }}
                className="gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Tambah dari URL
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Maksimal 5MB per gambar. Format: JPG, PNG, GIF. Gambar pertama akan jadi thumbnail.
            </p>
          </div>

          {/* Konten */}
          <div className="space-y-2">
            <Label htmlFor="content">Isi Berita</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis isi berita di sini..."
              rows={10}
              className="resize-none"
            />
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="published">Status Publikasi</Label>
              <p className="text-sm text-gray-500">
                {isPublished ? 'Berita akan ditampilkan' : 'Berita disimpan sebagai draft'}
              </p>
            </div>
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={uploading || importing}>
          {initialData?.id ? 'Perbarui Berita' : 'Simpan Berita'}
        </Button>
      </div>
    </form>
  )
}
