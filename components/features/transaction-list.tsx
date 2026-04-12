"use client"

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
import { Trash2, Eye } from "lucide-react"
import type { Transaction } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TransactionListProps {
  transactions: Transaction[]
  showActions?: boolean
  showCategory?: boolean
  showSubCategory?: boolean
  showPagination?: boolean
  onDelete?: (id: string) => void
}

const SUB_CATEGORY_LABELS = {
  INFAQ: 'Infaq',
  SADAQAH: 'Sadaqah',
  KEGIATAN: 'Kegiatan',
  OPERASIONAL: 'Operasional',
}

const SUB_CATEGORY_COLORS = {
  INFAQ: 'bg-emerald-100 text-emerald-700',
  SADAQAH: 'bg-blue-100 text-blue-700',
  KEGIATAN: 'bg-amber-100 text-amber-700',
  OPERASIONAL: 'bg-red-100 text-red-700',
}

export function TransactionList({
  transactions,
  showActions = false,
  showCategory = false,
  showSubCategory = true,
  showPagination = false,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada transaksi tersedia
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            {showCategory && <TableHead>Kategori</TableHead>}
            {showSubCategory && <TableHead>Jenis</TableHead>}
            <TableHead>Deskripsi</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            {showActions && <TableHead className="w-[100px]">Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {formatDate(transaction.date)}
              </TableCell>
              {showCategory && (
                <TableCell>
                  <Badge variant={transaction.category === 'MASJID' ? 'default' : 'secondary'}>
                    {transaction.category === 'MASJID' ? 'Masjid' : 'Dusun'}
                  </Badge>
                </TableCell>
              )}
              {showSubCategory && (
                <TableCell>
                  {transaction.sub_category ? (
                    <Badge className={SUB_CATEGORY_COLORS[transaction.sub_category]}>
                      {SUB_CATEGORY_LABELS[transaction.sub_category]}
                    </Badge>
                  ) : (
                    <Badge variant={transaction.type === 'INCOME' ? 'secondary' : 'destructive'}>
                      {transaction.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                    </Badge>
                  )}
                </TableCell>
              )}
              <TableCell>
                <div className="max-w-[200px] truncate" title={transaction.description}>
                  {transaction.description}
                </div>
                {transaction.reference_number && (
                  <div className="text-xs text-gray-500">
                    {transaction.reference_number}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                {transaction.type === 'EXPENSE' ? '-' : '+'}
                {formatRupiah(transaction.amount)}
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Detail Transaksi</DialogTitle>
                          <DialogDescription>
                            {transaction.reference_number}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-gray-500">Tanggal</div>
                            <div>{formatDate(transaction.date)}</div>
                            
                            <div className="text-gray-500">Kategori</div>
                            <div>{transaction.category === 'MASJID' ? 'Masjid' : 'Dusun'}</div>
                            
                            <div className="text-gray-500">Jenis</div>
                            <div>{transaction.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}</div>
                            
                            {transaction.sub_category && (
                              <>
                                <div className="text-gray-500">Sub Kategori</div>
                                <div>
                                  <Badge className={SUB_CATEGORY_COLORS[transaction.sub_category]}>
                                    {SUB_CATEGORY_LABELS[transaction.sub_category]}
                                  </Badge>
                                </div>
                              </>
                            )}
                            
                            <div className="text-gray-500">Jumlah</div>
                            <div className="font-bold">{formatRupiah(transaction.amount)}</div>
                            
                            <div className="text-gray-500">Deskripsi</div>
                            <div className="col-span-1">{transaction.description}</div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => onDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
