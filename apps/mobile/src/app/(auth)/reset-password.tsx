import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 32, fontWeight: '700', textAlign: 'center' }}>
              Reset Password
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
              {sent
                ? 'Check your email for a reset link'
                : 'Enter your email and we\'ll send you a reset link'
              }
            </Text>
          </View>

          {!sent && (
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
                  Email
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
                    padding: 12, fontSize: 16, backgroundColor: '#fff'
                  }}
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: '#2563eb', padding: 16, borderRadius: 8,
                  alignItems: 'center', opacity: loading ? 0.6 : 1
                }}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Link
            href="/(auth)/login"
            style={{ color: '#2563eb', textAlign: 'center', fontWeight: '500' }}
          >
            Back to Sign In
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
