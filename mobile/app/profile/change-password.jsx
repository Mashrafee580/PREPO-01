import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { authService } from '../../services/authService';
import { useToastStore } from '../../context/toastStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleChange = async () => {
    if (!form.current || !form.newPw || !form.confirm) { showToast('All fields required', 'error'); return; }
    if (form.newPw.length < 6) { showToast('New password must be at least 6 characters', 'error'); return; }
    if (form.newPw !== form.confirm) { showToast('Passwords do not match', 'error'); return; }
    setLoading(true);
    try {
      const res = await authService.changePassword(form.current, form.newPw);
      if (res.success) { showToast('Password changed!', 'success'); router.back(); }
      else showToast(res.message || 'Change failed', 'error');
    } catch (err) { showToast(err.message || 'Change failed', 'error'); }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Input label="Current Password" value={form.current} onChangeText={(v) => setField('current', v)} secureTextEntry />
          <Input label="New Password" value={form.newPw} onChangeText={(v) => setField('newPw', v)} secureTextEntry />
          <Input label="Confirm New Password" value={form.confirm} onChangeText={(v) => setField('confirm', v)} secureTextEntry />
          <Button title="Update Password" onPress={handleChange} loading={loading} fullWidth size="lg" style={{ marginTop: SIZES.md }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 12 },
  backText: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  container: { padding: SIZES.md },
});
