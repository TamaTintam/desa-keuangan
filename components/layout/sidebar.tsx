"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowLeftRight,
  HandHeart,
  FileText,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  BarChart3Icon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transaksi",
    href: "/dashboard/transaksi",
    icon: ArrowLeftRight,
  },
  {
    name: "Donasi",
    href: "/dashboard/donasi",
    icon: HandHeart,
  },
  {
    name: "Laporan",
    href: "/dashboard/laporan",
    icon: FileText,
  },
  {
    name: "Statistik",
    href: "/dashboard/statistik",
    icon: BarChart3Icon, // Tambahkan import Settings dari lucide-react
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r transition-all duration-300 hidden lg:block",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SIP</span>
              </div>
              <span className="font-bold text-xl">Polege Ku</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn("ml-auto", isCollapsed && "mx-auto")}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t space-y-2">
          <Link
            href="/dashboard/pengaturan"
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg",
              isCollapsed && "justify-center"
            )}
          >
            <Settings className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>Pengaturan</span>}
          </Link>
          <button
            onClick={signOut}
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
