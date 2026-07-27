import { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTransactions, useDeleteTransaction } from '@/hooks/use-transactions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TransactionsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const { data: transactions, isLoading, refetch } = useTransactions({
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
  });
  const deleteTransaction = useDeleteTransaction();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction.mutate(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ padding: 16, gap: 12 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#fff', borderRadius: 8,
          borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 12,
        }}>
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            style={{ flex: 1, padding: 10, fontSize: 15 }}
            placeholder="Search transactions..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['all', 'income', 'expense'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: typeFilter === t ? '#2563eb' : '#e5e7eb',
              }}
              onPress={() => setTypeFilter(t)}
            >
              <Text style={{
                fontWeight: '500', fontSize: 14,
                color: typeFilter === t ? '#fff' : '#374151',
              }}>
                {t === 'all' ? 'All' : t === 'income' ? 'Income' : 'Expenses'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : !transactions || transactions.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center', gap: 8 }}>
            <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
            <Text style={{ color: '#9ca3af', fontSize: 15 }}>No transactions found</Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <TouchableOpacity
              key={tx.id}
              style={{
                backgroundColor: '#fff', borderRadius: 10, padding: 14,
                flexDirection: 'row', justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onPress={() => router.push(`/transaction/${tx.id}`)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: tx.categories?.color ?? '#e5e7eb',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 18 }}>
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
                  <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                    {new Date(tx.transaction_date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{
                  fontWeight: '700', fontSize: 15,
                  color: tx.type === 'income' ? '#16a34a' : '#dc2626',
                }}>
                  {tx.type === 'income' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(tx.id)}>
                  <Ionicons name="trash-outline" size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
