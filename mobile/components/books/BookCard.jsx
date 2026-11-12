import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useCartStore } from '../../context/cartStore';
import { useToastStore } from '../../context/toastStore';
import StarRating from '../ui/StarRating';

export default function BookCard({ book, style }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);

  const handleAddToCart = (e) => {
    e.stopPropagation?.();
    addItem(book);
    showToast(`"${book.title}" added to cart`, 'success');
  };

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={() => router.push(`/books/${book._id}`)} activeOpacity={0.9}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: book.coverUrl || 'https://via.placeholder.com/160x220?text=📚' }} style={styles.image} resizeMode="cover" />
        {book.discount > 0 && (
          <View style={styles.discBadge}>
            <Text style={styles.discText}>-{book.discount}%</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
        <StarRating rating={book.rating} size={12} />
        <View style={styles.priceRow}>
          <Text style={styles.price}>${book.price?.toFixed(2)}</Text>
          {book.originalPrice > book.price && (
            <Text style={styles.originalPrice}>${book.originalPrice?.toFixed(2)}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>+ Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, width: 160, marginRight: SIZES.sm, ...SHADOWS.md, overflow: 'hidden' },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 180, backgroundColor: COLORS.secondary },
  discBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.accent, borderRadius: SIZES.radius.sm, paddingHorizontal: 7, paddingVertical: 3 },
  discText: { color: COLORS.white, fontSize: 10, fontWeight: FONTS.weights.bold },
  info: { padding: 10 },
  title: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 3, lineHeight: 18 },
  author: { fontSize: FONTS.sizes.xs, color: COLORS.muted, marginBottom: 5 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 8 },
  price: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.accent },
  originalPrice: { fontSize: FONTS.sizes.xs, color: COLORS.mutedLight, textDecorationLine: 'line-through', marginLeft: 6 },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius.sm, paddingVertical: 7, alignItems: 'center' },
  addBtnText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold },
});
