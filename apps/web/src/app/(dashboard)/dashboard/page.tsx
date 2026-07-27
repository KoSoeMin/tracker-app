'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useTransactions, useDeleteTransaction } from '@/hooks/use-transactions';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { AddTransactionModal } from '@/components/dashboard/add-transaction-modal';
import { CategoryDonutChart } from '@/components/dashboard/category-donut-chart';
import { IncomeExpenseBarChart } from '@/components/dashboard/income-expense-bar-chart';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { session, isLoading: authLoading } = useAuthStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [authLoading, session, router]);

  const { data: transactions, isLoading: transactionsLoading } = useTransactions({
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : (typeFilter as 'income' | 'expense'),
  });

  const deleteTransaction = useDeleteTransaction();

  function handleDelete(id: string) {
    deleteTransaction.mutate(id);
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your income and expenses
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Transaction</span>
        </button>
      </div>

      <div className="mb-8">
        <SummaryCards
          transactions={transactions}
          isLoading={transactionsLoading}
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <CategoryDonutChart transactions={transactions} />
        <IncomeExpenseBarChart transactions={transactions} />
      </div>

      <div className="mb-6">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
      </div>

      <TransactionList
        transactions={transactions}
        isLoading={transactionsLoading}
        onDelete={handleDelete}
        isDeleting={deleteTransaction.isPending}
      />

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
