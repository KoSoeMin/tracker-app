import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTransactions } from '@/hooks/use-transactions';
import { useSummary } from '@/hooks/use-summary';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';

function SummaryCard({ title, value, type, currency = 'MMK' }: {
  title: string;
  value: number;
  type: 'income' | 'expense' | 'net';
  currency?: string;
}) {
  const colorMap = {
    income: '#16a34a',
    expense: '#dc2626',
    net: value >= 0 ? '#16a34a' : '#dc2626',
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    }}>
      <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{title}</Text>
      <Text style={{
        fontSize: 20,
        fontWeight: '700',
        color: colorMap[type],
      }}>
        {value.toLocaleString()} {currency}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: transactions, isLoading: txLoading, refetch: refetchTx } = useTransactions({ pageSize: 5 });
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useSummary();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTx(), refetchSummary()]);
    setRefreshing(false);
  }, []);

  const loading = txLoading || summaryLoading;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      contentContainerStyle={{ padding: 16, gap: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <>
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Overview</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SummaryCard title="Total Income" value={summary?.total_income ?? 0} type="income" />
              <SummaryCard title="Total Expenses" value={summary?.total_expense ?? 0} type="expense" />
            </View>
            <SummaryCard title="Net Balance" value={summary?.net_balance ?? 0} type="net" />
          </View>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>Recent Transactions</Text>
            </View>

            {!transactions || transactions.length === 0 ? (
              <View style={{
                backgroundColor: '#fff', borderRadius: 12, padding: 32,
                alignItems: 'center', gap: 8,
              }}>
                <Ionicons name="receipt-outline" size={40} color="#d1d5db" />
                <Text style={{ color: '#9ca3af', textAlign: 'center' }}>
                  No transactions yet
                </Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {transactions.map((tx) => (
                  <View key={tx.id} style={{
                    backgroundColor: '#fff', borderRadius: 10, padding: 14,
                    flexDirection: 'row', justifyContent: 'space-between',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                      <View style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: tx.categories?.color ?? '#e5e7eb',
                        justifyContent: 'center', alignItems: 'center',
                      }}>
                        <Text style={{ fontSize: 16 }}>
                          {tx.categories?.icon ?? (tx.type === 'income' ? '📈' : '📉')}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', fontSize: 15 }} numberOfLines={1}>
                          {tx.categories?.name ?? (tx.type === 'income' ? 'Income' : 'Expense')}
                        </Text>
                        {tx.description && (
                          <Text style={{ color: '#6b7280', fontSize: 13 }} numberOfLines={1}>
                            {tx.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text style={{
                      fontWeight: '700', fontSize: 15,
                      color: tx.type === 'income' ? '#16a34a' : '#dc2626',
                    }}>
                      {tx.type === 'income' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
