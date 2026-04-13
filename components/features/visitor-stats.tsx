'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, TrendingUp, BarChart3, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts"

interface VisitorStatsData {
  period: string
  visits: number
  period_type: string
}

export function VisitorAnalytics() {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'year'>('7days')
  const [stats, setStats] = useState<VisitorStatsData[]>([])
  const [summary, setSummary] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Get summary stats
      const today = new Date().toISOString().split('T')[0]
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - 7)
      const startOfMonth = new Date()
      startOfMonth.setDate(startOfMonth.getDate() - 30)

      const { data: todayData } = await supabase
        .from('visitor_stats')
        .select('id', { count: 'exact' })
        .gte('visit_date', today)

      const { data: weekData } = await supabase
        .from('visitor_stats')
        .select('id', { count: 'exact' })
        .gte('visit_date', startOfWeek.toISOString().split('T')[0])

      const { data: monthData } = await supabase
        .from('visitor_stats')
        .select('id', { count: 'exact' })
        .gte('visit_date', startOfMonth.toISOString().split('T')[0])

      const { count: totalCount } = await supabase
        .from('visitor_stats')
        .select('id', { count: 'exact' })

      setSummary({
        today: todayData?.length || 0,
        thisWeek: weekData?.length || 0,
        thisMonth: monthData?.length || 0,
        total: totalCount || 0
      })

      // Get chart data
      let days = 7
      if (timeRange === '30days') days = 30
      if (timeRange === 'year') days = 365

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: visits } = await supabase
        .from('visitor_stats')
        .select('visit_date')
        .gte('visit_date', startDate.toISOString().split('T')[0])
        .order('visit_date', { ascending: true })

      // Group by date
      const grouped = (visits || []).reduce((acc: Record<string, number>, curr) => {
        const date = curr.visit_date
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      const chartData = Object.entries(grouped).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        visits: count
      }))

      setStats(chartData)
    } catch (error) {
      console.error('Error fetching visitor stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Statistik Pengunjung</h2>
          <p className="text-sm text-gray-500">Monitoring kunjungan website</p>
        </div>
        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Pilih periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 Hari Terakhir</SelectItem>
            <SelectItem value="30days">30 Hari Terakhir</SelectItem>
            <SelectItem value="year">1 Tahun</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.today}</p>
              <p className="text-xs text-gray-500">Hari Ini</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.thisWeek}</p>
              <p className="text-xs text-gray-500">Minggu Ini</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.thisMonth}</p>
              <p className="text-xs text-gray-500">Bulan Ini</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.total}</p>
              <p className="text-xs text-gray-500">Total Kunjungan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Grafik Kunjungan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Memuat data...
            </div>
          ) : stats.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Belum ada data kunjungan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
