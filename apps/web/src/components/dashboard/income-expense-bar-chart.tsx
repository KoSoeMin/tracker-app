'use client';

import type { TransactionWithCategory } from '@expense-tracker/shared';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface IncomeExpenseBarChartProps {
  transactions: TransactionWithCategory[] | undefined;
}

interface ChartData {
  date: string;
  income: number;
  expense: number;
}

export function IncomeExpenseBarChart({ transactions }: IncomeExpenseBarChartProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-400">No transaction data to chart</p>
      </div>
    );
  }

  const grouped = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    const date = new Date(t.transaction_date);
    const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const entry = grouped.get(key) ?? { income: 0, expense: 0 };

    if (t.type === 'income') {
      entry.income += Number(t.amount);
    } else {
      entry.expense += Number(t.amount);
    }

    grouped.set(key, entry);
  }

  const data: ChartData[] = Array.from(grouped.entries())
    .map(([date, { income, expense }]) => ({
      date,
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
    }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-900">Income vs Expenses</h3>
      <p className="mb-4 text-xs text-gray-400">Daily comparison</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    {payload.map((p, i) => (
                      <p
                        key={i}
                        className="text-sm"
                        style={{ color: p.color }}
                      >
                        {p.name}: ${Number(p.value).toFixed(2)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="expense"
              name="Expenses"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
