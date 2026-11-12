import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useAuthStore } from '../../context/authStore';
import { useToastStore } from '../../context/toastStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const showToast = useToastStore((s) => s.show);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      if (res.success) {
        showToast(`Welcome, ${res.data.user.name.split(' ')[0]}!`, 'success');
        router.replace('/(tabs)');
      } else {
        showToast(res.message || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join thousands of book lovers</Text>
          <View style={styles.form}>
            <Input label="Full Name" placeholder="Your full name" value={form.name} onChangeText={(v) => set('name', v)} autoCapitalize="words" error={errors.name} />
            <Input label="Email Address" placeholder="you@example.com" value={form.email} onChangeText={(v) => set('email', v)} keyboardType="email-address" error={errors.email} />
            <Input label="Password" placeholder="Min 6 characters" value={form.password} onChangeText={(v) => set('password', v)} secureTextEntry error={errors.password} />
            <Input label="Confirm Password" placeholder="Repeat password" value={form.confirm} onChangeText={(v) => set('confirm', v)} secureTextEntry error={errors.confirm} />
            <Button title="Create Account" onPress={handleRegister} loading={loading} fullWidth size="lg" style={{ marginTop: 8 }} />
          </View>
          <TouchableOpacity onPress={() => router.push('/auth/login')} style={{ marginTop: SIZES.xl }}>
            <Text style={styles.switchText}>Already have an account? <Text style={styles.switchLink}>Sign in</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SIZES.xl, flexGrow: 1 },
  back: { marginBottom: SIZES.lg },
  backText: { fontSize: FONTS.sizes.md, color: COLORS.accent, fontWeight: FONTS.weights.semibold },
  title: { fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.muted, marginBottom: SIZES.xl },
  form: { gap: 4 },
  switchText: { textAlign: 'center', fontSize: FONTS.sizes.md, color: COLORS.muted },
  switchLink: { color: COLORS.accent, fontWeight: FONTS.weights.bold },
});
