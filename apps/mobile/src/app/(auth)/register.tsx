import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    Alert.alert(
      'Check your email',
      'We sent you a confirmation link. Please verify your email to continue.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
    );
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) Alert.alert('Error', error.message);
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
              Create Account
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
              Start tracking your finances
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
                Full Name
              </Text>
              <TextInput
                style={{
                  borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
                  padding: 12, fontSize: 16, backgroundColor: '#fff'
                }}
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

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

            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
                Password
              </Text>
              <TextInput
                style={{
                  borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
                  padding: 12, fontSize: 16, backgroundColor: '#fff'
                }}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: '#2563eb', padding: 16, borderRadius: 8,
                alignItems: 'center', opacity: loading ? 0.6 : 1
              }}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderWidth: 1, borderColor: '#d1d5db', padding: 16, borderRadius: 8,
                alignItems: 'center'
              }}
              onPress={handleGoogleLogin}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151' }}>
                Continue with Google
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
            <Text style={{ color: '#6b7280' }}>Already have an account?</Text>
            <Link href="/(auth)/login" style={{ color: '#2563eb', fontWeight: '600' }}>
              Sign In
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
