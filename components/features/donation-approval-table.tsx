'use client'

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Donation } from "@/types"
import { 
  User, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Clock,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"

interface DonationApprovalTableProps {
  donations: Donation[]
  showPagination?: boolean
  itemsPerPage?: number
  onApprove?: (donation: Donation) => void
  onReject?: (donation: Donation, reason: string) => void
  updatingId?: string | null
}

export function DonationApprovalTable({ 
  donations, 
  showPagination = false, 
  itemsPerPage = 10,
  onApprove,
  onReject,
  updatingId
}: DonationApprovalTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  console.log('Table rendered. Dialog open:', isDialogOpen, 'Selected:', selectedDonation?.id)

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

  const handleApprove = (donation: Donation) => {
    console.log('Approve clicked for:', donation.id)
    if (onApprove) {
      onApprove(donation)
    }
  }

  const handleOpenReject = (donation: Donation) => {
    console.log('Opening reject dialog for:', donation.id)
    setSelectedDonation(donation)
    setRejectReason("")
    setIsDialogOpen(true)
  }

  const handleConfirmReject = () => {
    console.log('Confirm reject clicked. Selected:', selectedDonation?.id, 'Reason:', rejectReason)
    if (selectedDonation && onReject) {
      onReject(selectedDonation, rejectReason)
      setIsDialogOpen(false)
      setSelectedDonation(null)
      setRejectReason("")
    } else {
      console.error('Missing selectedDonation or onReject handler')
    }
  }

  const handleCloseDialog = () => {
    console.log('Closing dialog')
    setIsDialogOpen(false)
    setSelectedDonation(null)
    setRejectReason("")
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
        <p className="font-medium">Semua donasi sudah dikonfirmasi!</p>
        <p className="text-sm text-gray-400 mt-1">Tidak ada yang menunggu konfirmasi.</p>
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
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>No. Resi</TableHead>
              <TableHead>Nama Donatur</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDonations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Tidak ada data yang cocok
                </TableCell>
              </TableRow>
            ) : (
              paginatedDonations.map((donation, index) => (
                <TableRow key={donation.id} className="hover:bg-blue-50/50">
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded font-semibold">
                      {donation.receipt_number}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {donation.is_anonymous ? 'Hamba Allah' : donation.donor_name}
                        </p>
                        {donation.donor_phone && (
                          <p className="text-xs text-muted-foreground">{donation.donor_phone}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={donation.category === 'MASJID' ? 'default' : 'secondary'} className="text-xs">
                      {donation.category === 'MASJID' ? '🕌 Masjid' : '🏠 Dusun'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {donation.payment_method === 'CASH' ? '💵 Tunai' : '📲 Transfer'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-green-600 text-base">
                      {formatRupiah(donation.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(donation.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        onClick={() => handleApprove(donation)}
                        disabled={updatingId === donation.id}
                      >
                        {updatingId === donation.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Terima
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 border-red-200"
                        onClick={() => handleOpenReject(donation)}
                        disabled={updatingId === donation.id}
                        type="button"
                      >
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Menampilkan <span className="font-medium">{startIndex + 1}</span> -{' '}
            <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredDonations.length)}</span> dari{' '}
            <span className="font-medium">{filteredDonations.length}</span> data
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reject Dialog - FIX: pakai state terpisah */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md" onInteractOutside={handleCloseDialog}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ThumbsDown className="h-5 w-5" />
              Konfirmasi Penolakan
            </DialogTitle>
            <DialogDescription className="pt-3">
              <div className="space-y-2">
                <p>
                  Anda akan <strong className="text-red-600">MENOLAK</strong> donasi dari:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="font-medium text-gray-900">
                    {selectedDonation?.is_anonymous ? 'Hamba Allah' : selectedDonation?.donor_name}
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    {selectedDonation && formatRupiah(selectedDonation.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    No. Resi: {selectedDonation?.receipt_number}
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Alasan Penolakan <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <Input
                placeholder="Contoh: Bukti transfer tidak jelas, data tidak lengkap..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full"
                disabled={updatingId === selectedDonation?.id}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              disabled={updatingId === selectedDonation?.id}
              type="button"
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmReject}
              disabled={updatingId === selectedDonation?.id}
              type="button"
            >
              {updatingId === selectedDonation?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Tolak Donasi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
