import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { marketplaceService } from '../../services/marketplaceService';
import { useAuthStore } from '../../context/authStore';
import { useToastStore } from '../../context/toastStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { GENRES, CONDITIONS } from '../../constants/api';

export default function CreateListingScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);

  const [form, setForm] = useState({
    title: '', author: '', description: '', category: 'General',
    condition: 'Good', price: '', listingType: 'sell', location: '',
    coverUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.author.trim()) e.author = 'Author is required';
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) e.price = 'Enter a valid price';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await marketplaceService.createListing({
        ...form,
        price: parseFloat(form.price),
        sellerName: user.name,
      });
      if (res.success) {
        showToast('Listing submitted for review! 🎉', 'success');
        router.back();
      } else {
        showToast(res.message || 'Submission failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
    }
    setLoading(false);
  };

  const OptionRow = ({ label, options, field }) => (
    <View style={styles.optionGroup}>
      <Text style={styles.optLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((opt) => (
          <TouchableOpacity key={opt} style={[styles.chip, form[field] === opt && styles.chipActive]} onPress={() => setField(field, opt)}>
            <Text style={[styles.chipText, form[field] === opt && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>✕</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>List a Book</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
          <View style={styles.pendingNote}>
            <Text style={styles.pendingTitle}>📋 Review Required</Text>
            <Text style={styles.pendingText}>Your listing will be reviewed by our team before going live. This usually takes less than 24 hours.</Text>
          </View>

          <Input label="Book Title *" placeholder="Enter book title" value={form.title} onChangeText={(v) => setField('title', v)} autoCapitalize="words" error={errors.title} />
          <Input label="Author *" placeholder="Author name" value={form.author} onChangeText={(v) => setField('author', v)} autoCapitalize="words" error={errors.author} />
          <Input label="Description" placeholder="Describe the book's condition, edition, etc." value={form.description} onChangeText={(v) => setField('description', v)} multiline numberOfLines={3} />
          <Input label="Price ($) *" placeholder="0.00" value={form.price} onChangeText={(v) => setField('price', v)} keyboardType="decimal-pad" error={errors.price} />
          <Input label="Cover Image URL" placeholder="https://..." value={form.coverUrl} onChangeText={(v) => setField('coverUrl', v)} keyboardType="url" />
          <Input label="Your Location" placeholder="City, Country" value={form.location} onChangeText={(v) => setField('location', v)} />

          <OptionRow label="Listing Type" options={['sell', 'buy']} field="listingType" />
          <OptionRow label="Condition" options={CONDITIONS} field="condition" />
          <OptionRow label="Category" options={GENRES} field="category" />

          <Button title="Submit for Review" onPress={handleSubmit} loading={loading} fullWidth size="lg" style={{ marginTop: SIZES.md, marginBottom: SIZES.xxl }} />
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
  container: { padding: SIZES.md, paddingBottom: SIZES.xxl },
  pendingNote: { backgroundColor: '#fef9c3', borderRadius: SIZES.radius.lg, padding: SIZES.md, marginBottom: SIZES.md, borderLeftWidth: 4, borderLeftColor: COLORS.warning },
  pendingTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: '#92400e', marginBottom: 4 },
  pendingText: { fontSize: FONTS.sizes.xs, color: '#78350f', lineHeight: 18 },
  optionGroup: { marginBottom: SIZES.md },
  optLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: SIZES.radius.full, backgroundColor: COLORS.secondary, borderWidth: 1.5, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: FONTS.weights.medium, textTransform: 'capitalize' },
  chipTextActive: { color: COLORS.white },
});
