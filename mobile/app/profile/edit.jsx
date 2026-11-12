import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useAuthStore } from '../../context/authStore';
import { useToastStore } from '../../context/toastStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const showToast = useToastStore((s) => s.show);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', street: user?.address?.street || '', city: user?.address?.city || '', zip: user?.address?.zip || '' });
  const [loading, setLoading] = useState(false);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Name is required', 'error'); return; }
    setLoading(true);
    try {
      const res = await updateUser({ name: form.name, phone: form.phone, address: { street: form.street, city: form.city, zip: form.zip } });
      if (res.success) { showToast('Profile updated!', 'success'); router.back(); }
      else showToast(res.message || 'Update failed', 'error');
    } catch (err) { showToast(err.message || 'Update failed', 'error'); }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>✕</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Input label="Full Name *" value={form.name} onChangeText={(v) => setField('name', v)} autoCapitalize="words" />
          <Input label="Phone Number" value={form.phone} onChangeText={(v) => setField('phone', v)} keyboardType="phone-pad" />
          <Input label="Street Address" value={form.street} onChangeText={(v) => setField('street', v)} autoCapitalize="words" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Input label="City" value={form.city} onChangeText={(v) => setField('city', v)} autoCapitalize="words" /></View>
            <View style={{ flex: 1 }}><Input label="ZIP" value={form.zip} onChangeText={(v) => setField('zip', v)} keyboardType="numeric" /></View>
          </View>
          <Button title="Save Changes" onPress={handleSave} loading={loading} fullWidth size="lg" style={{ marginTop: SIZES.md, marginBottom: SIZES.xxl }} />
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
