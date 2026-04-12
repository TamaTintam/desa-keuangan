"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRupiah } from "@/lib/utils"
import { Building2, Home, Wallet, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface BalanceCardProps {
  title: string
  amount: number
  type: "total" | "masjid" | "dusun"
  description?: string
  onDetailClick?: () => void
  showDetailButton?: boolean
}

export function BalanceCard({ 
  title, 
  amount, 
  type, 
  description, 
  onDetailClick,
  showDetailButton = false
}: BalanceCardProps) {
  const icons = {
    total: Wallet,
    masjid: Building2,
    dusun: Home,
  }

  const colors = {
    total: {
      card: "border-blue-200 bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-700"
    },
    masjid: {
      card: "border-emerald-200 bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-600",
      text: "text-emerald-700"
    },
    dusun: {
      card: "border-orange-200 bg-orange-50",
      icon: "bg-orange-100 text-orange-600",
      text: "text-orange-700"
    },
  }

  const Icon = icons[type]
  const theme = colors[type]

  return (
    <Card className={cn("border-2 transition-all hover:shadow-md", theme.card)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-sm font-medium flex items-center gap-2", theme.text)}>
            <div className={cn("p-1.5 rounded-lg", theme.icon)}>
              <Icon className="h-4 w-4" />
            </div>
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold mb-3", theme.text)}>
          {formatRupiah(amount)}
        </div>
        
        {description && (
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            {description}
          </p>
        )}

        {showDetailButton && onDetailClick && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2 bg-white/80 hover:bg-white"
            onClick={onDetailClick}
          >
            <Eye className="h-4 w-4" />
            Lihat Detail Donasi
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
