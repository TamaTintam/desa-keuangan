'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { formatRupiah, generateReferenceNumber } from "@/lib/utils"
import { ArrowLeft, AlertCircle, Building2, Home, Wallet } from "lucide-react"
import Link from "next/link"

const transactionSchema = z.object({
  category: z.enum(['MASJID', 'DUSUN']),
  type: z.enum(['INCOME', 'EXPENSE']),
  sub_category: z.enum(['INFAQ', 'SADAQAH', 'KEGIATAN', 'OPERASIONAL']).optional(),
  amount: z.number().min(1000, "Minimal Rp 1.000"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  date: z.string(),
})

type TransactionForm = z.infer<typeof transactionSchema>

const SUB_CATEGORIES = [
  { value: 'INFAQ', label: 'Infaq', description: 'Donasi infaq dari warga' },
  { value: 'SADAQAH', label: 'Sadaqah', description: 'Sedekah dan sumbangan sukarela' },
  { value: 'KEGIATAN', label: 'Kegiatan', description: 'Biaya kegiatan dan acara' },
  { value: 'OPERASIONAL', label: 'Operasional', description: 'Biaya operasional harian' },
]

interface BalanceData {
  masjid: { income: number; expense: number; balance: number }
  dusun: { income: number; expense: number; balance: number }
}

export default function TambahTransaksiPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [error, setError] = useState<string>("")
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors }, setValue, watch, setError: setFormError } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
    }
  })

  const amount = watch('amount')
  const type = watch('type')
  const category = watch('category')

  // Fetch balance data on load
  useEffect(() => {
    const fetchBalance = async () => {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
      
      const { data: donations } = await supabase
        .from('donations')
        .select('*')

      // Calculate Masjid balance
      const masjidTrans = transactions?.filter(t => t.category === 'MASJID') || []
      const masjidDons = donations?.filter(d => d.category === 'MASJID') || []
      
      const masjidIncome = masjidTrans
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0) +
        masjidDons.reduce((sum, d) => sum + d.amount, 0)
      
      const masjidExpense = masjidTrans
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)

      // Calculate Dusun balance
      const dusunTrans = transactions?.filter(t => t.category === 'DUSUN') || []
      const dusunDons = donations?.filter(d => d.category === 'DUSUN') || []
      
      const dusunIncome = dusunTrans
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0) +
        dusunDons.reduce((sum, d) => sum + d.amount, 0)
      
      const dusunExpense = dusunTrans
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)

      setBalanceData({
        masjid: { income: masjidIncome, expense: masjidExpense, balance: masjidIncome - masjidExpense },
        dusun: { income: dusunIncome, expense: dusunExpense, balance: dusunIncome - dusunExpense }
      })
    }

    fetchBalance()
  }, [supabase])

  const onSubmit = async (data: TransactionForm) => {
    setIsSubmitting(true)
    setError("")

    // VALIDASI: Jika pengeluaran, pastikan tidak melebihi sisa saldo
    if (data.type === 'EXPENSE' && balanceData) {
      const currentBalance = data.category === 'MASJID' 
        ? balanceData.masjid.balance 
        : balanceData.dusun.balance
      
      if (data.amount > currentBalance) {
        setError(`Pengeluaran melebihi sisa saldo ${data.category === 'MASJID' ? 'Masjid' : 'Dusun'}. Sisa saldo: ${formatRupiah(currentBalance)}`)
        setIsSubmitting(false)
        return
      }
    }

    try {
      const { error } = await supabase.from('transactions').insert([{
        ...data,
        type: data.sub_category ? 'EXPENSE' : data.type,
        reference_number: generateReferenceNumber(data.sub_category ? 'EXPENSE' : data.type),
        created_by: (await supabase.auth.getUser()).data.user?.id,
      }])

      if (error) throw error

      router.push('/dashboard/transaksi')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      setError('Gagal menyimpan transaksi. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentBalance = () => {
    if (!balanceData || !category) return 0
    return category === 'MASJID' ? balanceData.masjid.balance : balanceData.dusun.balance
  }

  const getBalanceColor = () => {
    const balance = getCurrentBalance()
    if (balance <= 0) return 'text-red-600 bg-red-50 border-red-200'
    if (balance < 1000000) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/transaksi" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Kembali
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle>Tambah Transaksi Baru</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info Saldo */}
          {category && balanceData && (
            <div className={`p-4 rounded-lg border mb-6 ${getBalanceColor()}`}>
              <div className="flex items-center gap-2 mb-2">
                {category === 'MASJID' ? <Building2 className="h-5 w-5" /> : <Home className="h-5 w-5" />}
                <span className="font-semibold">
                  Sisa Saldo {category === 'MASJID' ? 'Masjid' : 'Dusun'}
                </span>
              </div>
              <div className="text-2xl font-bold">
                {formatRupiah(getCurrentBalance())}
              </div>
              <p className="text-sm opacity-80 mt-1">
                {type === 'EXPENSE' && amount > 0 && (
                  <>
                    Setelah transaksi: {formatRupiah(getCurrentBalance() - amount)}
                    {getCurrentBalance() - amount < 0 && (
                      <span className="text-red-600 font-bold ml-2">(Saldo tidak cukup!)</span>
                    )}
                  </>
                )}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori Sumber Dana *</Label>
                <Select onValueChange={(v) => setValue('category', v as 'MASJID' | 'DUSUN')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sumber dana" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASJID">Masjid</SelectItem>
                    <SelectItem value="DUSUN">Dusun</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Jenis Transaksi *</Label>
                <Select 
                  defaultValue="EXPENSE"
                  onValueChange={(v) => {
                    setValue('type', v as 'INCOME' | 'EXPENSE')
                    if (v === 'INCOME') {
                      setValue('sub_category', undefined)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="INCOME">Pemasukan</SelectItem> */}
                    <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sub Category - hanya untuk EXPENSE */}
            {type === 'EXPENSE' && (
              <div className="space-y-2">
                <Label>Kategori Pengeluaran *</Label>
                <Select onValueChange={(v) => setValue('sub_category', v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori pengeluaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUB_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex flex-col">
                          <span>{cat.label}</span>
                          <span className="text-xs text-muted-foreground">{cat.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sub_category && <p className="text-sm text-red-500">{errors.sub_category.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label>Jumlah (Rp) *</Label>
              <Input 
                type="number" 
                {...register('amount', { valueAsNumber: true })} 
                placeholder="50000"
              />
              {amount > 0 && (
                <p className="text-sm text-gray-500">
                  {formatRupiah(amount)}
                  {type === 'EXPENSE' && category && balanceData && amount > getCurrentBalance() && (
                    <span className="text-red-600 font-bold ml-2">
                      (Melebihi sisa saldo!)
                    </span>
                  )}
                </p>
              )}
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Deskripsi *</Label>
              <Textarea 
                {...register('description')} 
                placeholder="Deskripsi transaksi..."
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Tanggal *</Label>
              <Input type="date" {...register('date')} />
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || (type === 'EXPENSE' && category && balanceData && (amount || 0) > getCurrentBalance())} 
                className="flex-1"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
              </Button>
              <Link href="/dashboard/transaksi">
                <Button variant="outline" type="button">Batal</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
