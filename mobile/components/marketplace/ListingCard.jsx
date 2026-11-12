import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import Badge from '../ui/Badge';

export default function ListingCard({ listing }) {
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/marketplace/${listing._id}`)} activeOpacity={0.9}>
      <Image source={{ uri: listing.coverUrl || 'https://via.placeholder.com/80x110?text=📚' }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Badge label={listing.listingType === 'sell' ? 'Want to Sell' : 'Want to Buy'} preset={listing.listingType} size="xs" />
          <Badge label={listing.condition} preset="default" size="xs" />
        </View>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.author}>by {listing.author}</Text>
        {listing.description ? <Text style={styles.desc} numberOfLines={2}>{listing.description}</Text> : null}
        <View style={styles.footer}>
          <Text style={styles.price}>${parseFloat(listing.price).toFixed(2)}</Text>
          <View style={styles.meta}>
            <Text style={styles.seller}>{listing.sellerName}</Text>
            {listing.location ? <Text style={styles.loc}>📍 {listing.location}</Text> : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, padding: 12, marginBottom: 12, ...SHADOWS.sm },
  image: { width: 80, height: 110, borderRadius: SIZES.radius.md, backgroundColor: COLORS.secondary },
  info: { flex: 1, marginLeft: 12 },
  topRow: { flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  title: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 2 },
  author: { fontSize: FONTS.sizes.xs, color: COLORS.muted, marginBottom: 4 },
  desc: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, lineHeight: 17, marginBottom: 6 },
  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  price: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.accent },
  meta: { alignItems: 'flex-end' },
  seller: { fontSize: FONTS.sizes.xs, color: COLORS.muted, fontWeight: FONTS.weights.medium },
  loc: { fontSize: 10, color: COLORS.muted },
});
