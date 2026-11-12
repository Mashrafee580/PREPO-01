import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useCartStore } from '../../context/cartStore';
import { useToastStore } from '../../context/toastStore';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';

export default function BookGridCard({ book }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);

  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/books/${book._id}`)} activeOpacity={0.9}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: book.coverUrl || 'https://via.placeholder.com/160x200?text=📚' }} style={styles.image} resizeMode="cover" />
        {book.discount > 0 && <Badge label={`-${book.discount}%`} preset="accent" style={styles.badge} />}
        {book.stock === 0 && <View style={styles.outOfStock}><Text style={styles.oos}>Out of Stock</Text></View>}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={book.rating} size={12} />
          <Text style={styles.reviewCount}>({book.reviewCount})</Text>
        </View>
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>${book.price?.toFixed(2)}</Text>
            {book.originalPrice > book.price && (
              <Text style={styles.ogPrice}>${book.originalPrice?.toFixed(2)}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.cartBtn, book.stock === 0 && styles.cartBtnDisabled]}
            onPress={() => { addItem(book); showToast(`"${book.title}" added to cart`); }}
            disabled={book.stock === 0}
          >
            <Text style={styles.cartBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, flex: 1, margin: 6, ...SHADOWS.md, overflow: 'hidden' },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 180, backgroundColor: COLORS.secondary },
  badge: { position: 'absolute', top: 8, left: 8 },
  outOfStock: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  oos: { color: COLORS.white, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm },
  info: { padding: SIZES.sm },
  title: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 3, lineHeight: 18 },
  author: { fontSize: FONTS.sizes.xs, color: COLORS.muted, marginBottom: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewCount: { fontSize: 10, color: COLORS.muted, marginLeft: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.accent },
  ogPrice: { fontSize: 10, color: COLORS.mutedLight, textDecorationLine: 'line-through' },
  cartBtn: { backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cartBtnDisabled: { backgroundColor: COLORS.mutedLight },
  cartBtnText: { color: COLORS.white, fontSize: 20, lineHeight: 28, fontWeight: FONTS.weights.bold },
});
