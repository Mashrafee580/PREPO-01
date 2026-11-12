import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { membershipService } from '../../services/membershipService';
import { useAuthStore } from '../../context/authStore';
import { useToastStore } from '../../context/toastStore';
import { PLAN_FEATURES } from '../../constants/api';
import Button from '../../components/ui/Button';

export default function MembershipScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const showToast = useToastStore((s) => s.show);
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (plan) => {
    if (plan === user?.plan) { showToast('You are already on this plan', 'info'); return; }
    if (plan !== 'free') {
      Alert.alert('Confirm Subscription', `Subscribe to ${PLAN_FEATURES[plan].name} for $${PLAN_FEATURES[plan].price}/month?\n\n(Mock payment — no real charge)`, [
        { text: 'Cancel' },
        { text: 'Subscribe', onPress: () => doSubscribe(plan) },
      ]);
    } else {
      doSubscribe(plan);
    }
  };

  const doSubscribe = async (plan) => {
    setLoading(plan);
    try {
      const res = await membershipService.subscribe(plan);
      if (res.success) { await refreshUser(); showToast(`Subscribed to ${plan} plan! 🎉`, 'success'); }
      else showToast(res.message || 'Subscription failed', 'error');
    } catch (err) { showToast(err.message || 'Subscription failed', 'error'); }
    setLoading(null);
  };

  const PlanCard = ({ planKey }) => {
    const p = PLAN_FEATURES[planKey];
    const isCurrent = user?.plan === planKey;
    const isPopular = planKey === 'premium';
    const gradients = { free: ['#6b7280', '#9ca3af'], premium: [COLORS.primary, COLORS.primaryLight], ultimate: [COLORS.accent, '#e8845e'] };

    return (
      <View style={[styles.planCard, isCurrent && styles.planCardActive]}>
        {isPopular && <View style={styles.popularBadge}><Text style={styles.popularText}>Most Popular</Text></View>}
        <LinearGradient colors={gradients[planKey]} style={styles.planHeader}>
          <Text style={styles.planName}>{p.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.planPrice}>${p.price}</Text>
            <Text style={styles.planPeriod}>/month</Text>
          </View>
        </LinearGradient>
        <View style={styles.planBody}>
          {p.features.map((f) => (
            <View key={f} style={styles.featureItem}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
          <Button
            title={isCurrent ? 'Current Plan' : `Choose ${p.name}`}
            onPress={() => handleSubscribe(planKey)}
            loading={loading === planKey}
            variant={isCurrent ? 'secondary' : planKey === 'ultimate' ? 'accent' : 'primary'}
            fullWidth
            style={{ marginTop: SIZES.md }}
            disabled={isCurrent}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Membership Plans</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Unlock exclusive benefits and save more on every purchase</Text>
        <PlanCard planKey="free" />
        <PlanCard planKey="premium" />
        <PlanCard planKey="ultimate" />
        <Text style={styles.note}>🔒 Secure · Cancel anytime · No hidden fees</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 12 },
  backText: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  container: { padding: SIZES.md, paddingBottom: SIZES.xxl },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text, textAlign: 'center', marginVertical: SIZES.sm },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.muted, textAlign: 'center', marginBottom: SIZES.xl },
  planCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radius.xl, marginBottom: SIZES.md, overflow: 'hidden', ...SHADOWS.md },
  planCardActive: { borderWidth: 2, borderColor: COLORS.accent },
  popularBadge: { position: 'absolute', top: SIZES.md, right: SIZES.md, zIndex: 1, backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radius.full },
  popularText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  planHeader: { padding: SIZES.xl },
  planName: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  planPrice: { fontSize: 36, fontWeight: FONTS.weights.extrabold, color: COLORS.white },
  planPeriod: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.75)', marginLeft: 4 },
  planBody: { padding: SIZES.lg },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#dcfce7', textAlign: 'center', lineHeight: 24, fontSize: 12, color: COLORS.success, fontWeight: FONTS.weights.bold, marginRight: 10 },
  featureText: { fontSize: FONTS.sizes.sm, color: COLORS.text },
  note: { textAlign: 'center', fontSize: FONTS.sizes.xs, color: COLORS.muted, marginTop: SIZES.md },
});
