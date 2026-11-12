import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { marketplaceService } from '../../services/marketplaceService';
import { useAuthStore } from '../../context/authStore';
import ListingCard from '../../components/marketplace/ListingCard';
import EmptyState from '../../components/ui/EmptyState';
import { CONDITIONS, GENRES } from '../../constants/api';

const TABS = [{ id: 'all', label: 'All' }, { id: 'sell', label: 'Selling' }, { id: 'buy', label: 'Buying' }];

export default function MarketplaceScreen() {
  const router = useRouter();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search };
      if (tab !== 'all') params.type = tab;
      if (category) params.category = category;
      if (condition) params.condition = condition;
      const res = await marketplaceService.getListings(params);
      if (res.success) setListings(res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [tab, search, category, condition]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <Text style={styles.headerSub}>Buy & sell books with fellow readers</Text>
        </View>
        <TouchableOpacity
          style={styles.listBtn}
          onPress={() => isAuth ? router.push('/marketplace/create') : router.push('/auth/login')}
        >
          <Text style={styles.listBtnText}>+ List</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="Search listings..." placeholderTextColor={COLORS.muted} value={search} onChangeText={setSearch} />
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={[styles.filterToggle, showFilters && styles.filterToggleActive]}>
          <Text style={[styles.filterToggleText, showFilters && { color: COLORS.white }]}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.id} style={[styles.tab, tab === t.id && styles.tabActive]} onPress={() => setTab(t.id)}>
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 8 }}>
            {['', ...GENRES].map((g) => (
              <TouchableOpacity key={g} style={[styles.chip, category === g && styles.chipActive]} onPress={() => setCategory(g)}>
                <Text style={[styles.chipText, category === g && styles.chipTextActive]}>{g || 'All'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filterLabel}>Condition</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {['', ...CONDITIONS].map((c) => (
              <TouchableOpacity key={c} style={[styles.chip, condition === c && styles.chipActive]} onPress={() => setCondition(c)}>
                <Text style={[styles.chipText, condition === c && styles.chipTextActive]}>{c || 'Any'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.accent} size="large" />
      ) : listings.length === 0 ? (
        <EmptyState icon="🏪" title="No Listings Found" subtitle="Be the first to list a book!" actionLabel="List a Book" onAction={() => isAuth ? router.push('/marketplace/create') : router.push('/auth/login')} />
      ) : (
        <FlatList
          data={listings}
          renderItem={({ item }) => <ListingCard listing={item} />}
          keyExtractor={(i) => i._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.accent} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.white },
  headerSub: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.7)' },
  listBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: SIZES.radius.full },
  listBtnText: { color: COLORS.white, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, marginHorizontal: SIZES.md, marginVertical: 10, borderRadius: SIZES.radius.full, paddingHorizontal: SIZES.md, borderWidth: 1, borderColor: COLORS.border, gap: 8, ...SHADOWS.sm },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, paddingVertical: 12 },
  filterToggle: { backgroundColor: COLORS.secondary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: SIZES.radius.full },
  filterToggleActive: { backgroundColor: COLORS.primary },
  filterToggleText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold, color: COLORS.text },
  tabs: { flexDirection: 'row', marginHorizontal: SIZES.md, backgroundColor: COLORS.secondary, borderRadius: SIZES.radius.full, padding: 4, marginBottom: SIZES.sm },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: SIZES.radius.full },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONTS.sizes.sm, color: COLORS.muted, fontWeight: FONTS.weights.medium },
  tabTextActive: { color: COLORS.white, fontWeight: FONTS.weights.bold },
  filterPanel: { backgroundColor: COLORS.card, marginHorizontal: SIZES.md, borderRadius: SIZES.radius.lg, padding: SIZES.md, marginBottom: SIZES.sm, ...SHADOWS.sm },
  filterLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: SIZES.radius.full, backgroundColor: COLORS.secondary, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONTS.sizes.xs, color: COLORS.text },
  chipTextActive: { color: COLORS.white },
  list: { paddingHorizontal: SIZES.md, paddingBottom: SIZES.xl },
});
