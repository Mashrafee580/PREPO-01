import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';

const FEATURES = [
  { icon: '📚', title: 'Vast Book Collection', desc: 'Thousands of books across all genres, from classics to modern bestsellers.' },
  { icon: '🏪', title: 'P2P Marketplace', desc: 'Buy and sell used books with fellow readers at great prices.' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Multiple delivery options to get books to your doorstep quickly.' },
  { icon: '💎', title: 'Membership Plans', desc: 'Unlock exclusive discounts, early access, and premium benefits.' },
  { icon: '⭐', title: 'Curated Selections', desc: 'Expert-curated book recommendations tailored to your taste.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Your transactions are always safe and protected.' },
];

export default function AboutScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.hero}>
          <Text style={styles.heroIcon}>📖</Text>
          <Text style={styles.heroTitle}>PaperTrail</Text>
          <Text style={styles.heroSub}>Where every page leads somewhere new</Text>
        </LinearGradient>

        {/* Our Story */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.bodyText}>PaperTrail was born from a simple idea: books should be accessible to everyone. Founded in 2024, we set out to create a platform that connects book lovers with the stories they love — whether they're buying new, trading used, or discovering their next great read.</Text>
        </View>

        {/* Mission & Vision */}
        <View style={styles.mvRow}>
          <View style={[styles.mvCard, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.mvIcon}>🎯</Text>
            <Text style={styles.mvTitle}>Our Mission</Text>
            <Text style={styles.mvText}>To make reading more accessible, affordable, and community-driven for every book lover.</Text>
          </View>
          <View style={[styles.mvCard, { backgroundColor: COLORS.accent }]}>
            <Text style={styles.mvIcon}>🌟</Text>
            <Text style={styles.mvTitle}>Our Vision</Text>
            <Text style={styles.mvText}>A world where every book finds its reader and every reader finds their book.</Text>
          </View>
        </View>

        {/* Why Choose Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose PaperTrail?</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Marketplace Section */}
        <View style={styles.marketSection}>
          <Text style={styles.sectionTitle}>Our Marketplace</Text>
          <Text style={styles.bodyText}>The PaperTrail Marketplace is a peer-to-peer platform where readers can buy and sell their pre-loved books. Every listing is reviewed by our team to ensure quality and fair pricing. Connect with fellow book lovers in your community!</Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('mailto:support@papertrail.com')}>
            <Text style={styles.contactIcon}>📧</Text>
            <Text style={styles.contactText}>support@papertrail.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('tel:+8801404519140')}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>+880 140 451 9140</Text>
          </TouchableOpacity>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📍</Text>
            <Text style={styles.contactText}>Dhaka, Bangladesh</Text>
          </View>
        </View>

        {/* Social */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialRow}>
            {[{ icon: '📸', label: 'Instagram' }, { icon: '🐦', label: 'Twitter' }, { icon: '📘', label: 'Facebook' }].map((s) => (
              <TouchableOpacity key={s.label} style={styles.socialBtn}>
                <Text style={styles.socialIcon}>{s.icon}</Text>
                <Text style={styles.socialLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 PaperTrail. All rights reserved.</Text>
          <Text style={styles.footerText}>Made with ❤️ for book lovers everywhere</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 12 },
  backText: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  hero: { padding: SIZES.xxl, alignItems: 'center' },
  heroIcon: { fontSize: 64, marginBottom: SIZES.sm },
  heroTitle: { fontSize: 36, fontWeight: FONTS.weights.extrabold, color: COLORS.white, letterSpacing: 2 },
  heroSub: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },
  section: { padding: SIZES.xl },
  sectionTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SIZES.md },
  bodyText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 26 },
  mvRow: { flexDirection: 'row', paddingHorizontal: SIZES.md, gap: SIZES.sm },
  mvCard: { flex: 1, borderRadius: SIZES.radius.xl, padding: SIZES.lg },
  mvIcon: { fontSize: 32, marginBottom: 8 },
  mvTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white, marginBottom: 6 },
  mvText: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureCard: { width: '48%', backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, padding: SIZES.md, ...SHADOWS.sm },
  featureIcon: { fontSize: 28, marginBottom: 8 },
  featureTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 4 },
  featureDesc: { fontSize: FONTS.sizes.xs, color: COLORS.muted, lineHeight: 16 },
  marketSection: { backgroundColor: COLORS.secondary, padding: SIZES.xl },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  contactIcon: { fontSize: 20, marginRight: 12, width: 28 },
  contactText: { fontSize: FONTS.sizes.md, color: COLORS.text },
  socialSection: { padding: SIZES.xl, alignItems: 'center' },
  socialTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SIZES.md },
  socialRow: { flexDirection: 'row', gap: 16 },
  socialBtn: { alignItems: 'center', backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, padding: SIZES.md, minWidth: 80, ...SHADOWS.sm },
  socialIcon: { fontSize: 28, marginBottom: 4 },
  socialLabel: { fontSize: FONTS.sizes.xs, color: COLORS.text, fontWeight: FONTS.weights.medium },
  footer: { backgroundColor: COLORS.primary, padding: SIZES.xl, alignItems: 'center', gap: 6 },
  footerText: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.6)' },
});
