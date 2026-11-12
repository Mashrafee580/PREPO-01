import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { marketplaceService } from '../../services/marketplaceService';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function MyListingsScreen() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketplaceService.getMyListings().then((r) => { if (r.success) setListings(r.data); setLoading(false); });
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity onPress={() => router.push('/marketplace/create')} style={styles.addBtn}><Text style={styles.addBtnText}>+ New</Text></TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.accent} /> :
        listings.length === 0 ? <EmptyState icon="🏪" title="No Listings Yet" subtitle="List a book to start selling!" actionLabel="List a Book" onAction={() => router.push('/marketplace/create')} /> :
        <FlatList data={listings} keyExtractor={(i) => i._id} contentContainerStyle={styles.list} renderItem={({ item: l }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle} numberOfLines={1}>{l.title}</Text>
              <Badge label={l.status} preset={l.status === 'approved' ? 'approved' : l.status === 'rejected' ? 'rejected' : 'pending'} />
            </View>
            <Text style={styles.cardSub}>by {l.author} · ${parseFloat(l.price).toFixed(2)}</Text>
            <View style={styles.badgeRow}>
              <Badge label={l.listingType} preset={l.listingType === 'sell' ? 'sell' : 'buy'} size="xs" />
              <Badge label={l.condition} preset="default" size="xs" />
            </View>
            {l.status === 'rejected' && l.rejectionReason && (
              <View style={styles.rejectNote}>
                <Text style={styles.rejectText}>Rejected: {l.rejectionReason}</Text>
              </View>
            )}
          </View>
        )} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 12 },
  backText: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  addBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: SIZES.radius.full },
  addBtnText: { color: COLORS.white, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm },
  list: { padding: SIZES.md },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius.xl, padding: SIZES.md, marginBottom: SIZES.sm, ...SHADOWS.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginRight: 10 },
  cardSub: { fontSize: FONTS.sizes.sm, color: COLORS.muted, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  rejectNote: { backgroundColor: '#fee2e2', borderRadius: SIZES.radius.sm, padding: 8, marginTop: 8 },
  rejectText: { fontSize: FONTS.sizes.xs, color: COLORS.error },
});
