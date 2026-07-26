'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import type { Transaction, TransactionWithCategory, TransactionFilters } from '@expense-tracker/shared';

type NewTransaction = Pick<Transaction, 'amount' | 'type' | 'category_id' | 'payment_method' | 'description' | 'transaction_date'>;

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

export function useTransactions(filters?: TransactionFilters) {
  const userId = useAuthStore((s) => s.session?.user?.id);

  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from('transactions')
        .select('*, categories:category_id(name, icon, color)')
        .eq('user_id', userId!)
        .order('transaction_date', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod);
      }
      if (filters?.search) {
        query = query.textSearch('description', filters.search);
      }

      const page = filters?.page ?? 0;
      const pageSize = filters?.pageSize ?? 20;
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;
      return data as TransactionWithCategory[];
    },
    enabled: !!userId,
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user?.id);

  return useMutation({
    mutationFn: async (transaction: NewTransaction) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...transaction, user_id: userId })
        .select('*, categories:category_id(name, icon, color)')
        .single();

      if (error) throw error;
      return data as TransactionWithCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });
      const previousQueries = queryClient.getQueriesData<TransactionWithCategory[]>({
        queryKey: transactionKeys.lists(),
      });

      queryClient.setQueriesData<TransactionWithCategory[]>(
        { queryKey: transactionKeys.lists() },
        (old) => old?.filter((t) => t.id !== deletedId)
      );

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}
