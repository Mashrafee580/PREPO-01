import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { orderService } from '../../services/orderService';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function MyOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders().then((r) => { if (r.success) setOrders(r.data); setLoading(false); });
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.accent} /> :
        orders.length === 0 ? <EmptyState icon="📦" title="No Orders Yet" subtitle="Start shopping to see your orders here." actionLabel="Browse Books" onAction={() => router.push('/books')} /> :
        <FlatList data={orders} keyExtractor={(i) => i._id} contentContainerStyle={styles.list} renderItem={({ item: o }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/orders/${o._id}`)}>
            <View style={styles.cardTop}>
              <Text style={styles.orderNum}>{o.orderNumber}</Text>
              <Badge label={o.status} preset={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : 'pending'} />
            </View>
            <Text style={styles.orderInfo}>{o.items?.length} item{o.items?.length > 1 ? 's' : ''} · {o.delivery?.type} delivery</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
              <Text style={styles.orderTotal}>${parseFloat(o.total).toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 12 },
  backText: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  list: { padding: SIZES.md },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius.xl, padding: SIZES.md, marginBottom: SIZES.sm, ...SHADOWS.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderNum: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  orderInfo: { fontSize: FONTS.sizes.sm, color: COLORS.muted, marginBottom: 8 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { fontSize: FONTS.sizes.xs, color: COLORS.muted },
  orderTotal: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.accent },
});
