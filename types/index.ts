export type CategoryType = 'MASJID' | 'DUSUN';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionSubCategory = 'INFAQ' | 'SADAQAH' | 'KEGIATAN' | 'OPERASIONAL';

export interface Transaction {
  id: string;
  category: CategoryType;
  type: TransactionType;
  sub_category?: TransactionSubCategory;
  amount: number;
  description: string;
  date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  reference_number?: string;
  attachments?: string[];
}

export interface Donation {
  id: string;
  category: CategoryType;
  donor_name: string;
  donor_phone?: string;
  amount: number;
  message?: string;
  payment_method: 'CASH' | 'TRANSFER';
  date: string;
  is_anonymous: boolean;
  created_at: string;
  receipt_number: string;
}

export interface FinancialSummary {
  totalIncomeMasjid: number;
  totalExpenseMasjid: number;
  balanceMasjid: number;
  totalIncomeDusun: number;
  totalExpenseDusun: number;
  balanceDusun: number;
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  bySubCategory: {
    INFAQ: { income: number; expense: number };
    SADAQAH: { income: number; expense: number };
    KEGIATAN: { income: number; expense: number };
    OPERASIONAL: { income: number; expense: number };
  };
}


export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'VIEWER';
  name: string;
  created_at: string;
}

export interface DashboardStats {
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
  recentTransactions: Transaction[];
  recentDonations: Donation[];
  donorCount: number;
}
