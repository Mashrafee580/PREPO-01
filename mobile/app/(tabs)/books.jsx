import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { bookService } from '../../services/bookService';
import BookGridCard from '../../components/books/BookGridCard';
import { BookCardSkeleton } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import { GENRES } from '../../constants/api';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
];

export default function BooksScreen() {
  const { genre: initGenre } = useLocalSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState(initGenre || '');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const fetchBooks = useCallback(async (pg = 1, reset = false) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await bookService.getBooks({ search, genre, sort, page: pg, limit: LIMIT });
      if (res.success) {
        setBooks(reset || pg === 1 ? res.data : (prev) => [...prev, ...res.data]);
        setHasMore(pg < res.pagination.totalPages);
        setPage(pg);
      }
    } catch {}
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  }, [search, genre, sort]);

  useEffect(() => { fetchBooks(1, true); }, [fetchBooks]);

  const handleLoadMore = () => { if (hasMore && !loadingMore) fetchBooks(page + 1); };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Books</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books, authors..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Text style={styles.clear}>✕</Text></TouchableOpacity> : null}
      </View>

      {/* Genre filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {['All', ...GENRES].map((g) => {
          const active = g === 'All' ? !genre : genre === g;
          return (
            <TouchableOpacity key={g} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setGenre(g === 'All' ? '' : g)}>
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{g}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
        {SORT_OPTIONS.map((s) => (
          <TouchableOpacity key={s.value} style={[styles.sortBtn, sort === s.value && styles.sortBtnActive]} onPress={() => setSort(s.value)}>
            <Text style={[styles.sortBtnText, sort === s.value && styles.sortBtnTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <FlatList data={[1,2,3,4,5,6]} numColumns={2} renderItem={() => <View style={{ flex: 1, margin: 6 }}><BookCardSkeleton /></View>} keyExtractor={String} contentContainerStyle={styles.list} />
      ) : books.length === 0 ? (
        <EmptyState icon="📚" title="No Books Found" subtitle="Try adjusting your search or filters." actionLabel="Clear Filters" onAction={() => { setSearch(''); setGenre(''); }} />
      ) : (
        <FlatList
          data={books}
          numColumns={2}
          renderItem={({ item }) => <BookGridCard book={item} />}
          keyExtractor={(i) => i._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBooks(1, true); }} tintColor={COLORS.accent} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={COLORS.accent} style={{ padding: 20 }} /> : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.white },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, marginHorizontal: SIZES.md, marginVertical: 10, borderRadius: SIZES.radius.full, paddingHorizontal: SIZES.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, paddingVertical: 12 },
  clear: { fontSize: 16, color: COLORS.muted, padding: 4 },
  filterRow: { paddingHorizontal: SIZES.md, paddingVertical: 4, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radius.full, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: FONTS.weights.medium },
  filterChipTextActive: { color: COLORS.white },
  sortRow: { paddingHorizontal: SIZES.md, paddingVertical: 8, gap: 8 },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: SIZES.radius.sm, backgroundColor: COLORS.secondary },
  sortBtnActive: { backgroundColor: COLORS.accent },
  sortBtnText: { fontSize: FONTS.sizes.xs, color: COLORS.muted, fontWeight: FONTS.weights.medium },
  sortBtnTextActive: { color: COLORS.white },
  list: { paddingHorizontal: SIZES.sm, paddingBottom: SIZES.xl },
});
