import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  Dimensions, FlatList, Animated, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { bookService } from '../../services/bookService';
import { useAuthStore } from '../../context/authStore';
import { useCartStore } from '../../context/cartStore';
import BookCard from '../../components/books/BookCard';
import { BookCardSkeleton } from '../../components/ui/SkeletonLoader';

const { width } = Dimensions.get('window');

const BANNERS = [
  { id: 1, title: 'Discover New Worlds', subtitle: 'Explore thousands of books', cta: 'Browse Now', bg: ['#1a1f36', '#2d3461'] },
  { id: 2, title: 'Weekend Sale', subtitle: 'Up to 50% off bestsellers', cta: 'Shop Sale', bg: ['#c0603a', '#e8845e'] },
  { id: 3, title: 'Join Our Club', subtitle: 'Unlock exclusive member benefits', cta: 'View Plans', bg: ['#2d7a4f', '#4abe7c'] },
];

const CATEGORIES = [
  { label: 'Fiction', icon: '📖' }, { label: 'Science', icon: '🔬' },
  { label: 'Technology', icon: '💻' }, { label: 'Business', icon: '💼' },
  { label: 'History', icon: '🏛️' }, { label: 'Mystery', icon: '🔍' },
  { label: 'Romance', icon: '💕' }, { label: 'Self Development', icon: '🌱' },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartStore((s) => s.getCount());
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerRef = useRef(null);

  const load = async () => {
    try {
      const [f, n, b] = await Promise.all([
        bookService.getFeatured(),
        bookService.getNewArrivals(),
        bookService.getBestSellers(),
      ]);
      setFeatured(f.data || []);
      setNewArrivals(n.data || []);
      setBestSellers(b.data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-scroll banner
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (bannerIdx + 1) % BANNERS.length;
      setBannerIdx(next);
      bannerRef.current?.scrollTo({ x: next * width, animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerIdx]);

  const Section = ({ title, data, loading, onSeeAll }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All →</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <FlatList horizontal data={[1,2,3]} renderItem={() => <BookCardSkeleton />} keyExtractor={String} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SIZES.md }} ItemSeparatorComponent={() => <View style={{ width: 12 }} />} />
      ) : (
        <FlatList horizontal data={data} renderItem={({ item }) => <BookCard book={item} />} keyExtractor={(i) => i._id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SIZES.md }} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>PaperTrail</Text>
          <Text style={styles.greetText}>{user ? `Hello, ${user.name.split(' ')[0]} 👋` : 'Welcome back 👋'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/books')}>
            <Text style={styles.headerBtnIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/cart')}>
            <Text style={styles.headerBtnIcon}>🛒</Text>
            {cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.accent} />}>
        {/* Hero Banner Carousel */}
        <ScrollView ref={bannerRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / width))}>
          {BANNERS.map((b) => (
            <LinearGradient key={b.id} colors={b.bg} style={styles.banner}>
              <Text style={styles.bannerTitle}>{b.title}</Text>
              <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
              <TouchableOpacity style={styles.bannerCta} onPress={() => router.push('/books')}>
                <Text style={styles.bannerCtaText}>{b.cta}</Text>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </ScrollView>
        <View style={styles.dots}>
          {BANNERS.map((_, i) => <View key={i} style={[styles.dot, i === bannerIdx && styles.dotActive]} />)}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SIZES.md, paddingTop: SIZES.sm }}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c.label} style={styles.catCard} onPress={() => router.push({ pathname: '/books', params: { genre: c.label } })}>
                <Text style={styles.catIcon}>{c.icon}</Text>
                <Text style={styles.catLabel}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Section title="Featured Books" data={featured} loading={loading} onSeeAll={() => router.push('/books')} />
        <Section title="Best Sellers" data={bestSellers} loading={loading} onSeeAll={() => router.push('/books')} />
        <Section title="New Arrivals" data={newArrivals} loading={loading} onSeeAll={() => router.push('/books')} />

        {/* Membership Banner */}
        <TouchableOpacity style={styles.memberBanner} onPress={() => router.push('/profile')} activeOpacity={0.9}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.memberGrad}>
            <Text style={styles.memberTitle}>📖 Become a Member</Text>
            <Text style={styles.memberSub}>Unlock exclusive discounts, free shipping & more</Text>
            <View style={styles.memberBtn}><Text style={styles.memberBtnText}>View Plans →</Text></View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Why Choose PaperTrail */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why PaperTrail?</Text>
          <View style={styles.whyGrid}>
            {[{ icon: '📦', t: 'Fast Delivery', s: 'Get books at your doorstep' }, { icon: '💎', t: 'Premium Quality', s: 'Curated book selection' }, { icon: '🏪', t: 'Marketplace', s: 'Buy & sell used books' }, { icon: '🎁', t: 'Member Deals', s: 'Exclusive member discounts' }].map((w) => (
              <View key={w.t} style={styles.whyCard}>
                <Text style={styles.whyIcon}>{w.icon}</Text>
                <Text style={styles.whyTitle}>{w.t}</Text>
                <Text style={styles.whySub}>{w.s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Marketplace Promo */}
        <TouchableOpacity style={styles.marketBanner} onPress={() => router.push('/marketplace')} activeOpacity={0.9}>
          <Text style={styles.marketIcon}>🏪</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.marketTitle}>PaperTrail Marketplace</Text>
            <Text style={styles.marketSub}>Buy & sell books with fellow readers</Text>
          </View>
          <Text style={styles.marketArrow}>→</Text>
        </TouchableOpacity>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>PaperTrail</Text>
          <Text style={styles.footerSub}>Your friendly online bookstore</Text>
          <TouchableOpacity onPress={() => router.push('/about')}><Text style={styles.footerLink}>About Us</Text></TouchableOpacity>
          <Text style={styles.footerCopy}>© 2025 PaperTrail. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, backgroundColor: COLORS.primary },
  logoText: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold, color: COLORS.white, letterSpacing: 1 },
  greetText: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.7)' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerBtnIcon: { fontSize: 18 },
  cartBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: COLORS.accent, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: FONTS.weights.bold },
  banner: { width, height: 200, justifyContent: 'flex-end', padding: SIZES.xl },
  bannerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.white, marginBottom: 6 },
  bannerSubtitle: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.85)', marginBottom: SIZES.md },
  bannerCta: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 10, borderRadius: SIZES.radius.full, alignSelf: 'flex-start' },
  bannerCtaText: { color: COLORS.primary, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.primary, width: 20 },
  section: { paddingTop: SIZES.lg, paddingBottom: SIZES.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.md, marginBottom: SIZES.sm },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, paddingHorizontal: SIZES.md },
  seeAll: { fontSize: FONTS.sizes.sm, color: COLORS.accent, fontWeight: FONTS.weights.semibold },
  catCard: { alignItems: 'center', backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, paddingHorizontal: 16, paddingVertical: 12, marginRight: 10, ...SHADOWS.sm, minWidth: 80 },
  catIcon: { fontSize: 26, marginBottom: 6 },
  catLabel: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold, color: COLORS.text, textAlign: 'center' },
  memberBanner: { marginHorizontal: SIZES.md, marginVertical: SIZES.md, borderRadius: SIZES.radius.xl, overflow: 'hidden' },
  memberGrad: { padding: SIZES.xl },
  memberTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.white, marginBottom: 6 },
  memberSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginBottom: SIZES.md },
  memberBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: SIZES.radius.full, alignSelf: 'flex-start' },
  memberBtnText: { color: COLORS.white, fontWeight: FONTS.weights.bold },
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.md - 6 },
  whyCard: { width: '50%', padding: 6 },
  whyCardInner: { backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, padding: SIZES.md, ...SHADOWS.sm },
  whyIcon: { fontSize: 28, marginBottom: 8 },
  whyTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 4 },
  whySub: { fontSize: FONTS.sizes.xs, color: COLORS.muted, lineHeight: 16 },
  marketBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, marginHorizontal: SIZES.md, borderRadius: SIZES.radius.lg, padding: SIZES.md, marginBottom: SIZES.md, ...SHADOWS.sm },
  marketIcon: { fontSize: 36, marginRight: 14 },
  marketTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  marketSub: { fontSize: FONTS.sizes.xs, color: COLORS.muted },
  marketArrow: { fontSize: 20, color: COLORS.accent },
  footer: { backgroundColor: COLORS.primary, padding: SIZES.xl, alignItems: 'center', marginTop: SIZES.md },
  footerLogo: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold, color: COLORS.white, marginBottom: 4 },
  footerSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.6)', marginBottom: SIZES.sm },
  footerLink: { fontSize: FONTS.sizes.sm, color: COLORS.accentLight, marginBottom: SIZES.sm },
  footerCopy: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
});
