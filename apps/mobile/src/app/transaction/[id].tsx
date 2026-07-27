import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTransactions, useDeleteTransaction } from '@/hooks/use-transactions';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: transactions, isLoading } = useTransactions();
  const deleteTransaction = useDeleteTransaction();

  const transaction = transactions?.find((t) => t.id === id);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>Transaction not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteTransaction.mutateAsync(transaction.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={{
        backgroundColor: '#fff', borderRadius: 12, padding: 24,
        alignItems: 'center', gap: 8,
      }}>
        <View style={{
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: transaction.type === 'income' ? '#dcfce7' : '#fee2e2',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ fontSize: 28 }}>
            {transaction.categories?.icon ?? (transaction.type === 'income' ? '📈' : '📉')}
          </Text>
        </View>
        <Text style={{ fontSize: 32, fontWeight: '700', color: transaction.type === 'income' ? '#16a34a' : '#dc2626' }}>
          {transaction.type === 'income' ? '+' : '-'}{Number(transaction.amount).toLocaleString()}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>
          {transaction.categories?.name ?? (transaction.type === 'income' ? 'Income' : 'Expense')}
        </Text>
      </View>

      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#6b7280' }}>Type</Text>
          <Text style={{ fontWeight: '500', textTransform: 'capitalize' }}>{transaction.type}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#6b7280' }}>Payment Method</Text>
          <Text style={{ fontWeight: '500' }}>{transaction.payment_method}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#6b7280' }}>Date</Text>
          <Text style={{ fontWeight: '500' }}>
            {new Date(transaction.transaction_date).toLocaleDateString()}
          </Text>
        </View>
        {transaction.description && (
          <View>
            <Text style={{ color: '#6b7280', marginBottom: 4 }}>Description</Text>
            <Text style={{ fontWeight: '500' }}>{transaction.description}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: '#dc2626', padding: 16, borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={handleDelete}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Delete Transaction</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
