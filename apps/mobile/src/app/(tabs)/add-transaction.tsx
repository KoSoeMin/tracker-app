import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAddTransaction } from '@/hooks/use-transactions';
import { useCategories } from '@/hooks/use-categories';
import { PAYMENT_METHODS } from '@expense-tracker/shared';

export default function AddTransactionScreen() {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [description, setDescription] = useState('');
  const addTransaction = useAddTransaction();
  const { data: categories } = useCategories();

  const filteredCategories = categories?.filter((c) => c.type === type) ?? [];

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      await addTransaction.mutateAsync({
        amount: numAmount,
        type,
        category_id: categoryId,
        payment_method: paymentMethod,
        description: description || null,
        transaction_date: new Date().toISOString(),
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f9fafb' }}
        contentContainerStyle={{ padding: 16, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {(['expense', 'income'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={{
                flex: 1, padding: 14, borderRadius: 10, alignItems: 'center',
                backgroundColor: type === t ? (t === 'expense' ? '#dc2626' : '#16a34a') : '#e5e7eb',
              }}
              onPress={() => { setType(t); setCategoryId(''); }}
            >
              <Text style={{
                fontWeight: '600', fontSize: 15,
                color: type === t ? '#fff' : '#374151',
              }}>
                {t === 'expense' ? 'Expense' : 'Income'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
            Amount
          </Text>
          <TextInput
            style={{
              borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
              padding: 12, fontSize: 18, backgroundColor: '#fff',
              fontWeight: '700',
            }}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <View>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
            Category
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={{
                  paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
                  backgroundColor: categoryId === cat.id ? '#2563eb' : '#e5e7eb',
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                }}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={{ fontSize: 14 }}>{cat.icon ?? '📁'}</Text>
                <Text style={{
                  fontWeight: '500', fontSize: 14,
                  color: categoryId === cat.id ? '#fff' : '#374151',
                }}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
            Payment Method
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                style={{
                  paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
                  backgroundColor: paymentMethod === method ? '#2563eb' : '#e5e7eb',
                }}
                onPress={() => setPaymentMethod(method)}
              >
                <Text style={{
                  fontWeight: '500', fontSize: 14,
                  color: paymentMethod === method ? '#fff' : '#374151',
                }}>
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
            Description (optional)
          </Text>
          <TextInput
            style={{
              borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
              padding: 12, fontSize: 16, backgroundColor: '#fff', minHeight: 80,
              textAlignVertical: 'top',
            }}
            placeholder="Add a note..."
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#2563eb', padding: 16, borderRadius: 8,
            alignItems: 'center', opacity: addTransaction.isPending ? 0.6 : 1,
          }}
          onPress={handleSubmit}
          disabled={addTransaction.isPending}
        >
          {addTransaction.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Add Transaction</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
