import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { session, profile, reset } = useAuthStore();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
      setSigningOut(false);
      return;
    }
    reset();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={{
        backgroundColor: '#fff', borderRadius: 12, padding: 20,
        alignItems: 'center', gap: 8,
      }}>
        <View style={{
          width: 64, height: 64, borderRadius: 32,
          backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ fontSize: 28, color: '#fff', fontWeight: '700' }}>
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? session?.user?.email?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          {profile?.full_name ?? 'User'}
        </Text>
        <Text style={{ color: '#6b7280' }}>{session?.user?.email}</Text>
      </View>

      <View style={{ backgroundColor: '#fff', borderRadius: 12, gap: 1 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}
          onPress={() => {}}
        >
          <Ionicons name="person-outline" size={20} color="#374151" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '500', fontSize: 15 }}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}
          onPress={() => {}}
        >
          <Ionicons name="cash-outline" size={20} color="#374151" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '500', fontSize: 15 }}>Currency: {profile?.currency ?? 'MMK'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: '#fff', borderRadius: 12, padding: 16,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}
        onPress={handleSignOut}
        disabled={signingOut}
      >
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <View style={{ flex: 1 }}>
          {signingOut ? (
            <ActivityIndicator size="small" color="#dc2626" />
          ) : (
            <Text style={{ fontWeight: '500', fontSize: 15, color: '#dc2626' }}>Sign Out</Text>
          )}
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}
