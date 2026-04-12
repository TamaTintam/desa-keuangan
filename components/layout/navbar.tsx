"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Menu, X, Eye, HandHeart, LogIn } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SIP</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Sistem Informasi Polege</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2">
              Beranda
            </Link>
            <Link href="/transparansi" className="text-gray-600 hover:text-gray-900 px-3 py-2 flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Transparansi
            </Link>
            <Link href="/donasi/masuk" className="text-gray-600 hover:text-gray-900 px-3 py-2 flex items-center gap-1">
              <HandHeart className="h-4 w-4" />
              Donasi
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="gap-1">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <Link 
              href="/" 
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              Beranda
            </Link>
            <Link 
              href="/transparansi" 
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              Transparansi
            </Link>
            <Link 
              href="/donasi/masuk" 
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              Donasi
            </Link>
            <Link 
              href="/auth/login" 
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
