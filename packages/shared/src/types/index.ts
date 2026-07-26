export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  payment_method: string;
  description: string | null;
  receipt_url: string | null;
  transaction_date: string;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  categories: Pick<Category, 'name' | 'icon' | 'color'> | null;
}

export interface MonthlySummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
  transaction_count: number;
}

export interface CategoryBreakdown {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  total: number;
  percentage: number;
}

export interface TrendDataPoint {
  date: string;
  income: number;
  expense: number;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
  categoryId?: string;
  paymentMethod?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}
