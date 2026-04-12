"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRupiah } from "@/lib/utils"
import { Building2, Home, PieChart as PieChartIcon, BarChart3 } from "lucide-react"

interface SubCategoryData {
  income: number;
  expense: number;
}

interface FinancialChartProps {
  bySubCategory: {
    INFAQ: SubCategoryData;
    SADAQAH: SubCategoryData;
    KEGIATAN: SubCategoryData;
    OPERASIONAL: SubCategoryData;
  };
  // Tambahan data per kategori untuk masjid dan dusun
  bySubCategoryDetail?: {
    INFAQ: { masjid: number; dusun: number };
    SADAQAH: { masjid: number; dusun: number };
    KEGIATAN: { masjid: number; dusun: number };
    OPERASIONAL: { masjid: number; dusun: number };
  };
}

const SUB_CATEGORY_LABELS = {
  INFAQ: 'Infaq',
  SADAQAH: 'Sadaqah',
  KEGIATAN: 'Kegiatan',
  OPERASIONAL: 'Operasional',
}

const COLORS = {
  masjid: '#10b981',  // Emerald/Green untuk Masjid
  dusun: '#ef4444',   // Red untuk Dusun
}

export function FinancialChart({ bySubCategory, bySubCategoryDetail }: FinancialChartProps) {
  const [chartView, setChartView] = useState<"comparison" | "pie">("comparison")

  // Data perbandingan Pengeluaran Masjid vs Dusun per kategori
  const comparisonData = bySubCategoryDetail ? [
    {
      name: 'Infaq',
      masjid: bySubCategoryDetail.INFAQ.masjid,
      dusun: bySubCategoryDetail.INFAQ.dusun,
      total: bySubCategoryDetail.INFAQ.masjid + bySubCategoryDetail.INFAQ.dusun,
    },
    {
      name: 'Sadaqah',
      masjid: bySubCategoryDetail.SADAQAH.masjid,
      dusun: bySubCategoryDetail.SADAQAH.dusun,
      total: bySubCategoryDetail.SADAQAH.masjid + bySubCategoryDetail.SADAQAH.dusun,
    },
    {
      name: 'Kegiatan',
      masjid: bySubCategoryDetail.KEGIATAN.masjid,
      dusun: bySubCategoryDetail.KEGIATAN.dusun,
      total: bySubCategoryDetail.KEGIATAN.masjid + bySubCategoryDetail.KEGIATAN.dusun,
    },
    {
      name: 'Operasional',
      masjid: bySubCategoryDetail.OPERASIONAL.masjid,
      dusun: bySubCategoryDetail.OPERASIONAL.dusun,
      total: bySubCategoryDetail.OPERASIONAL.masjid + bySubCategoryDetail.OPERASIONAL.dusun,
    },
  ] : [
    // Fallback jika bySubCategoryDetail tidak tersedia, hitung dari bySubCategory
    {
      name: 'Infaq',
      masjid: 0,
      dusun: 0,
      total: bySubCategory.INFAQ.expense,
    },
    {
      name: 'Sadaqah',
      masjid: 0,
      dusun: 0,
      total: bySubCategory.SADAQAH.expense,
    },
    {
      name: 'Kegiatan',
      masjid: 0,
      dusun: 0,
      total: bySubCategory.KEGIATAN.expense,
    },
    {
      name: 'Operasional',
      masjid: 0,
      dusun: 0,
      total: bySubCategory.OPERASIONAL.expense,
    },
  ]

  // Data untuk Pie Chart - Total pengeluaran per kategori
  const pieData = [
    { name: 'Infaq', value: bySubCategory.INFAQ.expense, color: '#10b981' },
    { name: 'Sadaqah', value: bySubCategory.SADAQAH.expense, color: '#3b82f6' },
    { name: 'Kegiatan', value: bySubCategory.KEGIATAN.expense, color: '#f59e0b' },
    { name: 'Operasional', value: bySubCategory.OPERASIONAL.expense, color: '#ef4444' },
  ].filter(item => item.value > 0)

  const formatTooltipValue = (value: number) => {
    return formatRupiah(value)
  }

  const totalMasjid = comparisonData.reduce((sum, item) => sum + item.masjid, 0)
  const totalDusun = comparisonData.reduce((sum, item) => sum + item.dusun, 0)

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-end gap-2">
        <Button
          variant={chartView === "comparison" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartView("comparison")}
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Perbandingan
        </Button>
        <Button
          variant={chartView === "pie" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartView("pie")}
          className="gap-2"
        >
          <PieChartIcon className="h-4 w-4" />
          Proporsi
        </Button>
      </div>

      {/* Chart */}
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === "comparison" ? (
            <BarChart 
              data={comparisonData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 13, fontWeight: 500 }}
                stroke="#666"
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}jt`}
                stroke="#666"
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatRupiah(value), 
                  name === 'masjid' ? 'Pengeluaran Masjid' : 'Pengeluaran Dusun'
                ]}
                contentStyle={{ 
                  borderRadius: 8, 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  backgroundColor: 'white',
                  padding: '12px',
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => value === 'masjid' ? 'Pengeluaran Masjid' : 'Pengeluaran Dusun'}
              />
              <Bar 
                dataKey="masjid" 
                fill={COLORS.masjid} 
                radius={[6, 6, 0, 0]}
                barSize={36}
                name="masjid"
              />
              <Bar 
                dataKey="dusun" 
                fill={COLORS.dusun} 
                radius={[6, 6, 0, 0]}
                barSize={36}
                name="dusun"
              />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                labelLine={true}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatRupiah(value)} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Cards - Pengeluaran per Kategori */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {comparisonData.map((item) => (
          <Card key={item.name} className="border-l-4 border-l-gray-300">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">{item.name}</h4>
              
              <div className="space-y-3">
                {/* Masjid */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.masjid }}></div>
                    <span className="text-xs text-gray-600">Masjid</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {formatRupiah(item.masjid)}
                  </span>
                </div>
                
                {/* Dusun */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.dusun }}></div>
                    <span className="text-xs text-gray-600">Dusun</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    {formatRupiah(item.dusun)}
                  </span>
                </div>

                {/* Total */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-sm font-bold text-gray-800">
                      {formatRupiah(item.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-emerald-700">Total Pengeluaran Masjid</p>
                <p className="text-2xl font-bold text-emerald-700">{formatRupiah(totalMasjid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Home className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-700">Total Pengeluaran Dusun</p>
                <p className="text-2xl font-bold text-red-700">{formatRupiah(totalDusun)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
