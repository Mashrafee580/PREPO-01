import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { orderService } from '../../services/orderService';
import Badge from '../../components/ui/Badge';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];
const STATUS_ICONS = { pending: '⏳', confirmed: '✅', shipped: '🚚', delivered: '📦', cancelled: '❌' };

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrder(id).then((r) => { if (r.success) setOrder(r.data); setLoading(false); });
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
  if (!order) return <View style={styles.center}><Text>Order not found</Text></View>;

  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.orderNum}>{order.orderNumber}</Text>
        </View>

        {/* Status Tracker */}
        {order.status !== 'cancelled' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Status</Text>
            <View style={styles.tracker}>
              {STATUS_STEPS.map((s, i) => (
                <View key={s} style={styles.step}>
                  <View style={[styles.stepCircle, i <= stepIdx && styles.stepCircleActive]}>
                    <Text style={styles.stepIcon}>{i <= stepIdx ? '✓' : ''}</Text>
                  </View>
                  <Text style={[styles.stepLabel, i <= stepIdx && styles.stepLabelActive]}>{s}</Text>
                  {i < STATUS_STEPS.length - 1 && <View style={[styles.stepLine, i < stepIdx && styles.stepLineActive]} />}
                </View>
              ))}
            </View>
          </View>
        )}
        {order.status === 'cancelled' && <View style={styles.cancelledBanner}><Text style={styles.cancelledText}>❌ This order was cancelled</Text></View>}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          {order.items?.map((item, i) => (
            <View key={i} style={styles.item}>
              <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.itemRight}>
                <Text style={styles.itemQty}>×{item.qty}</Text>
                <Text style={styles.itemPrice}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipping Details</Text>
          <Text style={styles.infoText}>{order.shipping?.name}</Text>
          <Text style={styles.infoText}>{order.shipping?.address}, {order.shipping?.city} {order.shipping?.zip}</Text>
          <Text style={styles.infoText}>{order.shipping?.email}</Text>
          <Text style={styles.infoText}>{order.shipping?.phone}</Text>
        </View>

        {/* Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          <View style={styles.summRow}><Text style={styles.summLabel}>Subtotal</Text><Text style={styles.summVal}>${order.subtotal?.toFixed(2)}</Text></View>
          <View style={styles.summRow}><Text style={styles.summLabel}>Delivery ({order.delivery?.type})</Text><Text style={styles.summVal}>{order.delivery?.cost === 0 ? 'Free' : `$${order.delivery?.cost?.toFixed(2)}`}</Text></View>
          <View style={[styles.summRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalVal}>${order.total?.toFixed(2)}</Text></View>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.continueBtnText}>Continue Shopping →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 12 },
  backText: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  container: { padding: SIZES.md, gap: SIZES.md, paddingBottom: SIZES.xxl },
  successBanner: { backgroundColor: '#dcfce7', borderRadius: SIZES.radius.xl, padding: SIZES.xl, alignItems: 'center' },
  successIcon: { fontSize: 48, marginBottom: 8 },
  successTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.success, marginBottom: 4 },
  orderNum: { fontSize: FONTS.sizes.md, color: COLORS.muted, fontWeight: FONTS.weights.semibold },
  cancelledBanner: { backgroundColor: '#fee2e2', borderRadius: SIZES.radius.lg, padding: SIZES.md, alignItems: 'center' },
  cancelledText: { fontSize: FONTS.sizes.md, color: COLORS.error, fontWeight: FONTS.weights.semibold },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius.xl, padding: SIZES.md, ...SHADOWS.sm },
  cardTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SIZES.md },
  tracker: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  step: { alignItems: 'center', flex: 1, position: 'relative' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  stepCircleActive: { backgroundColor: COLORS.success },
  stepIcon: { color: COLORS.white, fontSize: 14, fontWeight: FONTS.weights.bold },
  stepLabel: { fontSize: 10, color: COLORS.muted, textAlign: 'center', textTransform: 'capitalize' },
  stepLabelActive: { color: COLORS.success, fontWeight: FONTS.weights.semibold },
  stepLine: { position: 'absolute', top: 15, left: '60%', right: '-40%', height: 2, backgroundColor: COLORS.border },
  stepLineActive: { backgroundColor: COLORS.success },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemTitle: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.text },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemQty: { fontSize: FONTS.sizes.sm, color: COLORS.muted },
  itemPrice: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text },
  infoText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 4, lineHeight: 20 },
  summRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summLabel: { fontSize: FONTS.sizes.sm, color: COLORS.muted },
  summVal: { fontSize: FONTS.sizes.sm, color: COLORS.text },
  totalRow: { borderBottomWidth: 0, paddingTop: 12 },
  totalLabel: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  totalVal: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold, color: COLORS.accent },
  continueBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius.full, padding: 16, alignItems: 'center' },
  continueBtnText: { color: COLORS.white, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.md },
});
