import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useCategories, useAddCategory } from '@/hooks/use-categories';
import { Ionicons } from '@expo/vector-icons';

export default function CategoriesScreen() {
  const { data: categories, isLoading } = useCategories();
  const addCategory = useAddCategory();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [icon, setIcon] = useState('📁');

  const expenseCategories = categories?.filter((c) => c.type === 'expense') ?? [];
  const incomeCategories = categories?.filter((c) => c.type === 'income') ?? [];

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }
    try {
      await addCategory.mutateAsync({ name: name.trim(), type, icon, color: '#6b7280' });
      setName('');
      setShowForm(false);
    } catch {
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const renderCategory = (cat: { id: string; name: string; icon: string | null; color: string | null; is_default: boolean }) => (
    <View key={cat.id} style={{
      backgroundColor: '#fff', borderRadius: 10, padding: 14,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    }}>
      <View style={{
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: cat.color ?? '#e5e7eb',
        justifyContent: 'center', alignItems: 'center',
      }}>
        <Text style={{ fontSize: 18 }}>{cat.icon ?? '📁'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', fontSize: 15 }}>{cat.name}</Text>
        {cat.is_default && (
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>Default</Text>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Expense Categories</Text>
      </View>
      <View style={{ gap: 8 }}>
        {expenseCategories.map(renderCategory)}
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600' }}>Income Categories</Text>
      <View style={{ gap: 8 }}>
        {incomeCategories.map(renderCategory)}
      </View>

      {showForm ? (
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 12 }}>
          <Text style={{ fontWeight: '600', fontSize: 16 }}>New Category</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['expense', 'income'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={{
                  flex: 1, padding: 10, borderRadius: 8, alignItems: 'center',
                  backgroundColor: type === t ? '#2563eb' : '#e5e7eb',
                }}
                onPress={() => setType(t)}
              >
                <Text style={{ fontWeight: '500', color: type === t ? '#fff' : '#374151' }}>
                  {t === 'expense' ? 'Expense' : 'Income'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={{
              borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
              padding: 12, fontSize: 16,
            }}
            placeholder="Category name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={{
              borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
              padding: 12, fontSize: 16,
            }}
            placeholder="Icon (emoji)"
            value={icon}
            onChangeText={setIcon}
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center',
              opacity: addCategory.isPending ? 0.6 : 1,
            }}
            onPress={handleAdd}
            disabled={addCategory.isPending}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {addCategory.isPending ? 'Adding...' : 'Add Category'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={{
            borderWidth: 1, borderColor: '#2563eb', borderRadius: 8,
            padding: 14, alignItems: 'center', borderStyle: 'dashed',
          }}
          onPress={() => setShowForm(true)}
        >
          <Text style={{ color: '#2563eb', fontWeight: '600' }}>+ Add Custom Category</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
