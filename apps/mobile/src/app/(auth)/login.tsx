import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    router.replace('/(tabs)/dashboard');
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
              Welcome Back
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
              Sign in to your account
            </Text>
          </View>

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
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Sign In</Text>
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
            <Text style={{ color: '#6b7280' }}>Don't have an account?</Text>
            <Link href="/(auth)/register" style={{ color: '#2563eb', fontWeight: '600' }}>
              Sign Up
            </Link>
          </View>

          <Link
            href="/(auth)/reset-password"
            style={{ color: '#2563eb', textAlign: 'center', fontWeight: '500' }}
          >
            Forgot password?
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
