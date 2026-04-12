"use client"

import { useState } from "react"
import { formatRupiah, formatDate } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Donation } from "@/types"
import { User, Search, ChevronLeft, ChevronRight } from "lucide-react"

interface DonationListProps {
  donations: Donation[]
  showPagination?: boolean
  itemsPerPage?: number
}

export function DonationList({ donations, showPagination = false, itemsPerPage = 10 }: DonationListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredDonations = donations.filter(donation => 
    donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (donation.donor_phone && donation.donor_phone.includes(searchTerm))
  )

  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDonations = showPagination 
    ? filteredDonations.slice(startIndex, startIndex + itemsPerPage)
    : filteredDonations

  if (donations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <HandHeart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Belum ada donasi tercatat</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari nama, no. resi, atau telepon..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>No. Resi</TableHead>
              <TableHead>Nama Donatur</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDonations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Tidak ada data yang cocok
                </TableCell>
              </TableRow>
            ) : (
              paginatedDonations.map((donation, index) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {donation.receipt_number}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {donation.is_anonymous ? 'Hamba Allah' : donation.donor_name}
                        </p>
                        {donation.donor_phone && (
                          <p className="text-xs text-muted-foreground">{donation.donor_phone}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={donation.category === 'MASJID' ? 'default' : 'secondary'}>
                      {donation.category === 'MASJID' ? 'Masjid' : 'Dusun'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {donation.payment_method === 'CASH' ? 'Tunai' : 'Transfer'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-green-600">
                      {formatRupiah(donation.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(donation.date)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredDonations.length)} dari {filteredDonations.length} data
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Halaman {currentPage} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

import { HandHeart } from "lucide-react"
