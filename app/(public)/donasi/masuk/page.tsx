'use client'

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { formatRupiah, generateReceiptNumber } from "@/lib/utils"
import { CheckCircle, Copy, Printer, Download, Share2, Building2, Home, Calendar, User, Banknote } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const donationSchema = z.object({
  category: z.enum(['MASJID', 'DUSUN']),
  donor_name: z.string().min(2, "Nama minimal 2 karakter"),
  donor_phone: z.string().optional(),
  amount: z.number().min(10000, "Minimal donasi Rp 10.000"),
  message: z.string().optional(),
  payment_method: z.enum(['CASH', 'TRANSFER']),
  is_anonymous: z.boolean().default(false),
})

type DonationForm = z.infer<typeof donationSchema>

// Komponen untuk tampilan cetak
function DonationReceipt({ 
  donation, 
  receiptNumber 
}: { 
  donation: DonationForm & { date: string }
  receiptNumber: string 
}) {
  return (
    <div className="p-8 bg-white max-w-md mx-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">SIP</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sistim Informasi Polege</h1>
        <p className="text-sm text-gray-600">Bukti Donasi</p>
        <p className="text-xs text-gray-500 mt-1">
          {donation.category === 'MASJID' ? 'Masjid' : 'Dusun'}
        </p>
      </div>

      {/* Receipt Number */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6 text-center">
        <p className="text-xs text-gray-500 mb-1">Nomor Resi</p>
        <p className="text-xl font-bold font-mono text-gray-900">{receiptNumber}</p>
      </div>

      {/* Details */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
          <span className="text-gray-600">Tanggal</span>
          <span className="font-medium">
            {new Date(donation.date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        
        <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
          <span className="text-gray-600">Nama Donatur</span>
          <span className="font-medium">
            {donation.is_anonymous ? 'Hamba Allah' : donation.donor_name}
          </span>
        </div>

        {donation.donor_phone && (
          <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
            <span className="text-gray-600">No. Telepon</span>
            <span className="font-medium">{donation.donor_phone}</span>
          </div>
        )}

        <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
          <span className="text-gray-600">Metode Pembayaran</span>
          <span className="font-medium">
            {donation.payment_method === 'CASH' ? 'Tunai' : 'Transfer Bank'}
          </span>
        </div>

        {donation.message && (
          <div className="border-b border-dashed border-gray-300 pb-2">
            <span className="text-gray-600 block mb-1">Pesan:</span>
            <span className="font-medium italic">"{donation.message}"</span>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center mb-6">
        <p className="text-sm text-green-700 mb-1">Jumlah Donasi</p>
        <p className="text-3xl font-bold text-green-800">{formatRupiah(donation.amount)}</p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
        <p>Terima kasih atas donasi Anda</p>
        <p className="mt-1">Donasi akan digunakan untuk kepentingan {donation.category === 'MASJID' ? 'Masjid' : 'Dusun'}</p>
        <p className="mt-4 font-mono">--- Simpan bukti ini sebagai tanda terima ---</p>
      </div>
    </div>
  )
}

export default function DonationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [submittedData, setSubmittedData] = useState<(DonationForm & { date: string }) | null>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<DonationForm>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      is_anonymous: false,
      payment_method: 'CASH',
    }
  })

  const amount = watch('amount')
  const category = watch('category')

  const onSubmit = async (data: DonationForm) => {
    setIsSubmitting(true)
    const supabase = createClient()
    const receipt = generateReceiptNumber()
    const date = new Date().toISOString()

    try {
      const { error } = await supabase.from('donations').insert([
        {
          ...data,
          receipt_number: receipt,
          date: date,
        }
      ])

      if (error) throw error

      setReceiptNumber(receipt)
      setSubmittedData({ ...data, date })
      reset()
    } catch (error) {
      console.error('Error submitting donation:', error)
      alert('Gagal menyimpan donasi. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyReceipt = () => {
    if (receiptNumber) {
      navigator.clipboard.writeText(receiptNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML
    if (!printContents) return

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Bukti Donasi - ${receiptNumber}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
                .no-print { display: none; }
              }
            </style>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            ${printContents}
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleDownload = () => {
    // Simulate download (in real app, generate PDF)
    const element = document.createElement("a")
    const file = new Blob([
      `BUKTI DONASI\n\n` +
      `Nomor Resi: ${receiptNumber}\n` +
      `Nama: ${submittedData?.is_anonymous ? 'Hamba Allah' : submittedData?.donor_name}\n` +
      `Jumlah: ${formatRupiah(submittedData?.amount || 0)}\n` +
      `Tanggal: ${submittedData ? new Date(submittedData.date).toLocaleDateString('id-ID') : ''}\n` +
      `Kategori: ${submittedData?.category === 'MASJID' ? 'Masjid' : 'Dusun'}\n`
    ], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `bukti-donasi-${receiptNumber}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (receiptNumber && submittedData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Terima Kasih!</h2>
            <p className="text-gray-600 mb-6">
              Donasi Anda telah tercatat. Simpan nomor resi berikut:
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-1">Nomor Resi Donasi</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-xl font-bold text-green-700 font-mono">{receiptNumber}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyReceipt}
                  className="h-8 w-8 p-0"
                >
                  {copied ? "✓" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-green-600">
                {submittedData.is_anonymous ? 'Donasi Anonim' : submittedData.donor_name}
              </p>
              <p className="text-lg font-bold text-green-800 mt-2">
                {formatRupiah(submittedData.amount)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button 
                onClick={() => setShowPrintModal(true)}
                className="gap-2"
                variant="outline"
              >
                <Printer className="h-4 w-4" />
                Cetak Bukti
              </Button>
              <Button 
                onClick={handleDownload}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="flex gap-2 justify-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setReceiptNumber(null)
                  setSubmittedData(null)
                }}
              >
                Kembali ke Form
              </Button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Tunjukkan nomor resi kepada petugas untuk verifikasi
            </p>
          </CardContent>
        </Card>

        {/* Print Modal */}
        <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Pratinjau Bukti Donasi</span>
                <Button onClick={handlePrint} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Cetak Sekarang
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div ref={printRef} className="border rounded-lg">
              <DonationReceipt 
                donation={submittedData} 
                receiptNumber={receiptNumber} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Formulir Donasi</CardTitle>
            <CardDescription>
              Berikan donasi untuk Masjid atau kepentingan Dusun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label>Kategori Donasi *</Label>
                <Select onValueChange={(v) => setValue('category', v as 'MASJID' | 'DUSUN')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tujuan donasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASJID">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Masjid
                      </div>
                    </SelectItem>
                    <SelectItem value="DUSUN">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Dusun
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              {/* Donor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Donor *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      {...register('donor_name')} 
                      placeholder="Nama lengkap"
                      className="pl-10"
                    />
                  </div>
                  {errors.donor_name && (
                    <p className="text-sm text-red-500">{errors.donor_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>No. Telepon</Label>
                  <Input {...register('donor_phone')} placeholder="08xx-xxxx-xxxx" />
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_anonymous" 
                  onCheckedChange={(checked) => setValue('is_anonymous', checked as boolean)}
                />
                <Label htmlFor="is_anonymous" className="text-sm cursor-pointer">
                  Sembunyikan nama (donasi anonim)
                </Label>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>Jumlah Donasi (Rp) *</Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="number" 
                    {...register('amount', { valueAsNumber: true })}
                    placeholder="100000"
                    className="pl-10"
                  />
                </div>
                {amount > 0 && (
                  <p className="text-sm text-gray-500">{formatRupiah(amount)}</p>
                )}
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Metode Pembayaran *</Label>
                <Select 
                  defaultValue="CASH"
                  onValueChange={(v) => setValue('payment_method', v as 'CASH' | 'TRANSFER')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Tunai (Cash)</SelectItem>
                    <SelectItem value="TRANSFER">Transfer Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label>Pesan (Opsional)</Label>
                <Input {...register('message')} placeholder="Pesan untuk pengurus..." />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Kirim Donasi"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
