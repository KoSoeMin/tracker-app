'use client';

import type { TransactionWithCategory } from '@expense-tracker/shared';
import { Trash2, Loader2 } from 'lucide-react';

interface TransactionListProps {
  transactions: TransactionWithCategory[] | undefined;
  isLoading: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function TransactionRow({
  transaction,
  onDelete,
  isDeleting,
}: {
  transaction: TransactionWithCategory;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const date = new Date(transaction.transaction_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(transaction.amount));

  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
          style={{
            backgroundColor: transaction.categories?.color
              ? `${transaction.categories.color}20`
              : '#f3f4f6',
          }}
        >
          {transaction.categories?.icon ?? (
            <span className="text-sm font-medium text-gray-500">
              {transaction.categories?.name?.charAt(0) ?? '?'}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {transaction.categories?.name ?? 'Uncategorized'}
          </p>
          {transaction.description && (
            <p className="text-xs text-gray-500">{transaction.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p
            className={`text-sm font-semibold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {amount}
          </p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <button
          onClick={() => onDelete(transaction.id)}
          disabled={isDeleting}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TransactionList({
  transactions,
  isLoading,
  onDelete,
  isDeleting,
}: TransactionListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
          </div>

      {isLoading ? (
        <Skeleton />
      ) : !transactions || transactions.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-gray-500">
          No transactions yet. Add one to get started.
        </div>
      ) : (
        <div>
          {transactions.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
