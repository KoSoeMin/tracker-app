'use client';

import type { TransactionWithCategory } from '@expense-tracker/shared';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  transactions: TransactionWithCategory[] | undefined;
  isLoading: boolean;
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  variant,
}: {
  title: string;
  value: string;
  icon: typeof TrendingUp;
  variant: 'income' | 'expense' | 'balance';
}) {
  const colorMap = {
    income: 'text-green-600 bg-green-50',
    expense: 'text-red-600 bg-red-50',
    balance: 'text-blue-600 bg-blue-50',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`rounded-lg p-2 ${colorMap[variant]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 h-8 w-32 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

export function SummaryCards({ transactions, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  const totalIncome =
    transactions
      ?.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const totalExpense =
    transactions
      ?.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const balance = totalIncome - totalExpense;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard
        title="Total Income"
        value={formatCurrency(totalIncome)}
        icon={TrendingUp}
        variant="income"
      />
      <SummaryCard
        title="Total Expenses"
        value={formatCurrency(totalExpense)}
        icon={TrendingDown}
        variant="expense"
      />
      <SummaryCard
        title="Net Balance"
        value={formatCurrency(balance)}
        icon={Wallet}
        variant="balance"
      />
    </div>
  );
}
