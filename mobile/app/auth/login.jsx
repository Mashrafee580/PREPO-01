import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useAuthStore } from '../../context/authStore';
import { useToastStore } from '../../context/toastStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const showToast = useToastStore((s) => s.show);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login(email.trim().toLowerCase(), password);
      if (res.success) {
        showToast(`Welcome back, ${res.data.user.name.split(' ')[0]}!`, 'success');
        if (res.data.user.role === 'admin') router.replace('/admin');
        else router.replace('/(tabs)');
      } else {
        showToast(res.message || 'Login failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
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

          <View style={styles.logoWrap}>
            <Text style={styles.logo}>📖</Text>
            <Text style={styles.appName}>PaperTrail</Text>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue reading</Text>

          <View style={styles.form}>
            <Input label="Email Address" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" error={errors.email} />
            <Input label="Password" placeholder="Your password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
            <Button title="Sign In" onPress={handleLogin} loading={loading} fullWidth size="lg" style={{ marginTop: 8 }} />
          </View>

          <View style={styles.divider}><View style={styles.divLine} /><Text style={styles.divText}>or</Text><View style={styles.divLine} /></View>

          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.switchText}>Don't have an account? <Text style={styles.switchLink}>Create one</Text></Text>
          </TouchableOpacity>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Accounts</Text>
            <Text style={styles.demoText}>Admin: admin@papertrail.com / admin123</Text>
            <Text style={styles.demoText}>User: user@papertrail.com / user123</Text>
          </View>
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
  logoWrap: { alignItems: 'center', marginBottom: SIZES.xl },
  logo: { fontSize: 56 },
  appName: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.primary, letterSpacing: 1 },
  title: { fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.muted, marginBottom: SIZES.xl },
  form: { gap: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SIZES.xl, gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divText: { fontSize: FONTS.sizes.sm, color: COLORS.muted },
  switchText: { textAlign: 'center', fontSize: FONTS.sizes.md, color: COLORS.muted },
  switchLink: { color: COLORS.accent, fontWeight: FONTS.weights.bold },
  demoBox: { backgroundColor: COLORS.secondary, borderRadius: SIZES.radius.lg, padding: SIZES.md, marginTop: SIZES.xl },
  demoTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 6 },
  demoText: { fontSize: FONTS.sizes.xs, color: COLORS.muted, marginBottom: 3 },
});
