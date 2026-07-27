'use client';

import type { TransactionWithCategory } from '@expense-tracker/shared';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CategoryDonutChartProps {
  transactions: TransactionWithCategory[] | undefined;
}

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f43f5e', '#a855f7', '#6366f1',
];

interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

export function CategoryDonutChart({ transactions }: CategoryDonutChartProps) {
  const expenses = transactions?.filter((t) => t.type === 'expense') ?? [];
  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

  if (totalExpense === 0) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-400">No expense data to chart</p>
      </div>
    );
  }

  const categoryMap = new Map<string, { value: number; color: string }>();

  for (const t of expenses) {
    const name = t.categories?.name ?? 'Uncategorized';
    const color = t.categories?.color ?? '#9ca3af';
    const existing = categoryMap.get(name);
    if (existing) {
      existing.value += Number(t.amount);
    } else {
      categoryMap.set(name, { value: Number(t.amount), color });
    }
  }

  const data: ChartData[] = Array.from(categoryMap.entries())
    .map(([name, { value, color }], i) => ({
      name,
      value,
      color: color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      percentage: ((value / totalExpense) * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-900">Expense Breakdown</h3>
      <p className="mb-4 text-xs text-gray-400">By category</p>

      <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
        <div className="h-52 w-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload as ChartData;
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                      <p className="text-sm font-medium text-gray-900">{d.name}</p>
                      <p className="text-sm text-gray-500">
                        ${d.value.toFixed(2)} ({d.percentage}%)
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex-1 space-y-2 sm:mt-0">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
              <span className="text-xs font-medium text-gray-900">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
