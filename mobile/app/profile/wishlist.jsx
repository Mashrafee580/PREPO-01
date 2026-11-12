import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import api from '../../services/api';
import BookGridCard from '../../components/books/BookGridCard';
import EmptyState from '../../components/ui/EmptyState';

export default function WishlistScreen() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist/my').then((r) => { if (r.data.success) setBooks(r.data.data.books || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 40 }} />
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.accent} /> :
        books.length === 0 ? <EmptyState icon="❤️" title="Wishlist is Empty" subtitle="Add books you love to your wishlist." actionLabel="Browse Books" onAction={() => router.push('/books')} /> :
        <FlatList data={books} numColumns={2} keyExtractor={(i) => i._id} contentContainerStyle={styles.list} renderItem={({ item }) => <BookGridCard book={item} />} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 12 },
  backText: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  list: { padding: SIZES.sm },
});
