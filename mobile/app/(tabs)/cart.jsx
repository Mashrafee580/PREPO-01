import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useCartStore } from '../../context/cartStore';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { DELIVERY_OPTIONS } from '../../constants/api';

export default function CartScreen() {
  const router = useRouter();
  const { items, deliveryOption, updateQty, removeItem, clearCart, setDelivery, getSubtotal, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}><Text style={styles.headerTitle}>My Cart</Text></View>
        <EmptyState icon="🛒" title="Your cart is empty" subtitle="Browse our collection and add some books!" actionLabel="Browse Books" onAction={() => router.push('/books')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <TouchableOpacity onPress={clearCart}><Text style={styles.clearBtn}>Clear All</Text></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.section}>
          {items.map((item) => (
            <View key={item._id} style={styles.cartItem}>
              <Image source={{ uri: item.coverUrl || 'https://via.placeholder.com/70x100?text=📚' }} style={styles.itemImage} resizeMode="cover" />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemAuthor}>{item.author}</Text>
                <Text style={styles.itemPrice}>${(item.price * item.qty).toFixed(2)}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => item.qty > 1 ? updateQty(item._id, item.qty - 1) : removeItem(item._id)}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item._id, Math.min(item.qty + 1, item.stock || 99))}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeItem(item._id)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Delivery Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Options</Text>
          {DELIVERY_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.id} style={[styles.deliveryOption, deliveryOption.id === opt.id && styles.deliveryOptionActive]} onPress={() => setDelivery(opt)}>
              <View style={[styles.radio, deliveryOption.id === opt.id && styles.radioActive]}>
                {deliveryOption.id === opt.id && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.deliveryLabel, deliveryOption.id === opt.id && { color: COLORS.primary }]}>{opt.label}</Text>
                <Text style={styles.deliverySub}>{opt.subtitle}</Text>
              </View>
              <Text style={[styles.deliveryPrice, deliveryOption.id === opt.id && { color: COLORS.accent }]}>
                {opt.price === 0 ? 'Free' : `$${opt.price.toFixed(2)}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>${getSubtotal().toFixed(2)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery</Text><Text style={styles.summaryValue}>{deliveryOption.price === 0 ? 'Free' : `$${deliveryOption.price.toFixed(2)}`}</Text></View>
            <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>${getTotal().toFixed(2)}</Text></View>
          </View>
        </View>

        <View style={{ paddingHorizontal: SIZES.md, paddingBottom: SIZES.xxl }}>
          <Button title="Proceed to Checkout" onPress={() => router.push('/checkout')} size="lg" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.white },
  clearBtn: { fontSize: FONTS.sizes.sm, color: COLORS.accentLight },
  section: { backgroundColor: COLORS.card, marginHorizontal: SIZES.md, marginTop: SIZES.md, borderRadius: SIZES.radius.xl, padding: SIZES.md, ...SHADOWS.sm },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SIZES.md },
  cartItem: { flexDirection: 'row', marginBottom: SIZES.md, paddingBottom: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemImage: { width: 70, height: 100, borderRadius: SIZES.radius.sm, backgroundColor: COLORS.secondary },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 3, lineHeight: 18 },
  itemAuthor: { fontSize: FONTS.sizes.xs, color: COLORS.muted, marginBottom: 6 },
  itemPrice: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.accent, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  qtyBtnText: { fontSize: 18, color: COLORS.text, lineHeight: 22 },
  qtyText: { width: 36, textAlign: 'center', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  removeBtn: { padding: 8 },
  removeBtnText: { fontSize: 16, color: COLORS.muted },
  deliveryOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: SIZES.radius.md, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 8 },
  deliveryOptionActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}08` },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  deliveryLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text },
  deliverySub: { fontSize: FONTS.sizes.xs, color: COLORS.muted, marginTop: 2 },
  deliveryPrice: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text },
  summaryCard: {},
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryLabel: { fontSize: FONTS.sizes.md, color: COLORS.muted },
  summaryValue: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: FONTS.weights.medium },
  totalRow: { borderBottomWidth: 0, paddingTop: 12 },
  totalLabel: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  totalValue: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold, color: COLORS.accent },
});
