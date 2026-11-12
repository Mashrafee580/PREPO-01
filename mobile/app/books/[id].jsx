import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { bookService } from '../../services/bookService';
import { useCartStore } from '../../context/cartStore';
import { useToastStore } from '../../context/toastStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, rRes] = await Promise.all([bookService.getBook(id), bookService.getReviews(id)]);
        if (bRes.success) setBook(bRes.data);
        if (rRes.success) setReviews(rRes.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
  if (!book) return <View style={styles.loadingWrap}><Text>Book not found</Text></View>;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(book, 1);
    showToast(`"${book.title}" added to cart`, 'success');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{book.title}</Text>
        <TouchableOpacity onPress={() => router.push('/cart')}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={styles.coverSection}>
          <Image source={{ uri: book.coverUrl || 'https://via.placeholder.com/200x280?text=📚' }} style={styles.cover} resizeMode="contain" />
          {book.discount > 0 && <Badge label={`-${book.discount}% OFF`} preset="accent" style={styles.discBadge} />}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>by {book.author}</Text>

          <View style={styles.ratingRow}>
            <StarRating rating={book.rating} size={18} showCount count={book.reviewCount} />
            <Badge label={book.genre} preset="default" style={{ marginLeft: 10 }} />
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${book.price?.toFixed(2)}</Text>
            {book.originalPrice > book.price && <Text style={styles.ogPrice}>${book.originalPrice?.toFixed(2)}</Text>}
            {book.stock === 0 ? <Badge label="Out of Stock" preset="error" /> : <Badge label={`${book.stock} in stock`} preset="success" />}
          </View>

          {book.description && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>About this book</Text>
              <Text style={styles.desc}>{book.description}</Text>
            </View>
          )}

          {/* Quantity */}
          {book.stock > 0 && (
            <View style={styles.qtySection}>
              <Text style={styles.qtyLabel}>Quantity</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyVal}>{qty}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.min(book.stock, qty + 1))}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            <Button title="Add to Cart" onPress={handleAddToCart} disabled={book.stock === 0} variant="outline" style={{ flex: 1 }} />
            <Button title="Buy Now" onPress={handleBuyNow} disabled={book.stock === 0} style={{ flex: 1 }} />
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.reviewsTitle}>Customer Reviews</Text>
              {reviews.slice(0, 5).map((r) => (
                <View key={r._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewInitial}>{r.user?.name?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{r.user?.name}</Text>
                      <StarRating rating={r.rating} size={13} />
                    </View>
                  </View>
                  {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 12 },
  backBtn: { marginRight: 12, padding: 4 },
  backText: { fontSize: 22, color: COLORS.white },
  headerTitle: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.white },
  cartIcon: { fontSize: 22 },
  coverSection: { alignItems: 'center', paddingVertical: SIZES.xl, backgroundColor: COLORS.secondary, position: 'relative' },
  cover: { width: 180, height: 260, borderRadius: SIZES.radius.md, ...SHADOWS.lg },
  discBadge: { position: 'absolute', top: SIZES.md, right: SIZES.md },
  infoSection: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: SIZES.xl },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text, marginBottom: 6, lineHeight: 32 },
  author: { fontSize: FONTS.sizes.md, color: COLORS.muted, marginBottom: SIZES.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.md },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SIZES.md },
  price: { fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.extrabold, color: COLORS.accent },
  ogPrice: { fontSize: FONTS.sizes.lg, color: COLORS.mutedLight, textDecorationLine: 'line-through' },
  descSection: { marginVertical: SIZES.md },
  descTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 8 },
  desc: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 24 },
  qtySection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: SIZES.md },
  qtyLabel: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  qtyBtnText: { fontSize: 20, color: COLORS.text, lineHeight: 24 },
  qtyVal: { width: 48, textAlign: 'center', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  actions: { flexDirection: 'row', gap: 12, marginVertical: SIZES.md },
  reviewsSection: { marginTop: SIZES.lg },
  reviewsTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SIZES.md },
  reviewCard: { backgroundColor: COLORS.background, borderRadius: SIZES.radius.md, padding: SIZES.md, marginBottom: SIZES.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  reviewInitial: { color: COLORS.white, fontWeight: FONTS.weights.bold },
  reviewName: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 2 },
  reviewComment: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
});
