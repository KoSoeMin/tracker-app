'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, PAYMENT_METHODS } from '@expense-tracker/shared';
import type { Category } from '@expense-tracker/shared';
import { useAddTransaction } from '@/hooks/use-transactions';
import { useCategories } from '@/hooks/use-categories';
import { X, Loader2 } from 'lucide-react';
import { z } from 'zod';

const getLocalDatetimeString = (date = new Date()) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const formSchema = transactionSchema.extend({
  amount: z
    .string()
    .transform((v) => {
      const parsed = parseFloat(v);
      if (isNaN(parsed)) return 0;
      return parsed;
    })
    .pipe(z.number().positive('Amount must be greater than 0')),
  transaction_date: z
    .string()
    .transform((v) => new Date(v).toISOString())
    .pipe(z.string().datetime()),
});

type FormValues = z.input<typeof formSchema>;

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ open, onClose }: AddTransactionModalProps) {
  const { data: categories } = useCategories();
  const addTransaction = useAddTransaction();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '' as unknown as number,
      type: 'expense' as const,
      category_id: '' as string,
      payment_method: 'Cash' as const,
      transaction_date: getLocalDatetimeString(),
      description: '',
    },
  });

  const selectedType = watch('type') as 'income' | 'expense';

  const filteredCategories =
    categories?.filter((c) => c.type === selectedType) ?? [];

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  async function onSubmit(data: Record<string, unknown>) {
    await addTransaction.mutateAsync(
      {
        amount: Number(data.amount),
        type: data.type as 'income' | 'expense',
        category_id: data.category_id as string,
        payment_method: data.payment_method as string,
        description: (data.description as string) || null,
        transaction_date: data.transaction_date as string,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Transaction</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-2">
            <label
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border py-2 text-sm font-medium transition-colors ${
                selectedType === 'expense'
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <input type="radio" value="expense" {...register('type')} className="sr-only" />
              Expense
            </label>
            <label
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border py-2 text-sm font-medium transition-colors ${
                selectedType === 'income'
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <input type="radio" value="income" {...register('type')} className="sr-only" />
              Income
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...register('amount')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              {...register('category_id')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon ?? ''} {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-xs text-red-500">{errors.category_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment</label>
              <select
                {...register('payment_method')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="datetime-local"
                {...register('transaction_date')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.transaction_date && (
                <p className="mt-1 text-xs text-red-500">{errors.transaction_date.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Add a note..."
              {...register('description')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
