import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import type { MonthlySummary } from '@expense-tracker/shared';

export function useSummary(startDate?: string, endDate?: string) {
  const userId = useAuthStore((s) => s.session?.user?.id);

  return useQuery({
    queryKey: ['summary', startDate, endDate],
    queryFn: async () => {
      let incomeQuery = supabase
        .from('transactions')
        .select('amount', { count: 'exact', head: true })
        .eq('user_id', userId!)
        .eq('type', 'income');
      let expenseQuery = supabase
        .from('transactions')
        .select('amount', { count: 'exact', head: true })
        .eq('user_id', userId!)
        .eq('type', 'expense');

      if (startDate) {
        incomeQuery = incomeQuery.gte('transaction_date', startDate);
        expenseQuery = expenseQuery.gte('transaction_date', startDate);
      }
      if (endDate) {
        incomeQuery = incomeQuery.lte('transaction_date', endDate);
        expenseQuery = expenseQuery.lte('transaction_date', endDate);
      }

      const [incomeRes, expenseRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', userId!)
          .eq('type', 'income')
          .gte('transaction_date', startDate || '1900-01-01')
          .lte('transaction_date', endDate || '2100-01-01'),
        supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', userId!)
          .eq('type', 'expense')
          .gte('transaction_date', startDate || '1900-01-01')
          .lte('transaction_date', endDate || '2100-01-01'),
      ]);

      if (incomeRes.error) throw incomeRes.error;
      if (expenseRes.error) throw expenseRes.error;

      const totalIncome = incomeRes.data.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpense = expenseRes.data.reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        total_income: totalIncome,
        total_expense: totalExpense,
        net_balance: totalIncome - totalExpense,
        transaction_count: incomeRes.data.length + expenseRes.data.length,
      } satisfies MonthlySummary;
    },
    enabled: !!userId,
  });
}
