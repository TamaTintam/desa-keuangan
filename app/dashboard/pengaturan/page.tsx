import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Settings, Youtube, Newspaper, Image as ImageIcon } from "lucide-react"
import { SettingsForm } from "@/components/features/settings-form"
import { NewsManager } from "@/components/features/news-manager"

async function getSettings() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .order('key')

  const { data: news } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })

  return {
    settings: settings || [],
    news: news || []
  }
}

export default async function PengaturanPage() {
  const { settings, news } = await getSettings()

  const youtubeUrl = settings.find(s => s.key === 'hero_youtube_url')?.value || ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            Pengaturan Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Kelola konten website dan berita kegiatan</p>
        </div>
      </div>

      <Tabs defaultValue="berita" className="space-y-6">
        <TabsList>
          <TabsTrigger value="berita" className="gap-2">
            <Newspaper className="h-4 w-4" />
            Berita Kegiatan
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2">
            <Youtube className="h-4 w-4" />
            Video Hero
          </TabsTrigger>
          <TabsTrigger value="umum" className="gap-2">
            <Settings className="h-4 w-4" />
            Umum
          </TabsTrigger>
        </TabsList>

        {/* Tab Berita */}
        <TabsContent value="berita">
          <NewsManager initialNews={news} />
        </TabsContent>

        {/* Tab Video */}
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                Video Hero Section
              </CardTitle>
              <CardDescription>
                Atur video YouTube yang ditampilkan di halaman utama
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm
                settingKey="hero_youtube_url"
                label="URL Video YouTube (Embed)"
                description="Gunakan format embed URL, contoh: https://www.youtube.com/embed/VIDEO_ID"
                defaultValue={youtubeUrl}
                placeholder="https://www.youtube.com/embed/..."
              />

              {youtubeUrl && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 max-w-lg">
                    <iframe
                      src={youtubeUrl}
                      title="Hero Video Preview"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Umum */}
        <TabsContent value="umum">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Website</CardTitle>
                <CardDescription>Informasi umum website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingsForm
                  settingKey="site_name"
                  label="Nama Website"
                  defaultValue={settings.find(s => s.key === 'site_name')?.value || ''}
                />
                <SettingsForm
                  settingKey="site_description"
                  label="Deskripsi Website"
                  defaultValue={settings.find(s => s.key === 'site_description')?.value || ''}
                  type="textarea"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
