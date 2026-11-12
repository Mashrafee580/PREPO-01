import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../context/authStore';
import { useToastStore } from '../../context/toastStore';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const TABS = ['Dashboard', 'Users', 'Orders', 'Marketplace', 'Memberships', 'Messages'];

export default function AdminScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState(null);

  if (!user || user.role !== 'admin') {
    router.replace('/(tabs)');
    return null;
  }

  useEffect(() => { loadTab(); }, [tab]);

  const loadTab = async () => {
    setLoading(true);
    try {
      if (tab === 'Dashboard') { const r = await adminService.getStats(); if (r.success) setStats(r.data); }
      else if (tab === 'Users') { const r = await adminService.getUsers(); if (r.success) setUsers(r.data); }
      else if (tab === 'Orders') { const r = await adminService.getAllOrders(); if (r.success) setOrders(r.data); }
      else if (tab === 'Marketplace') { const r = await adminService.getAllListings(); if (r.success) setListings(r.data); }
      else if (tab === 'Memberships') { const r = await adminService.getMemberships(); if (r.success) setMemberships(r.data); }
      else if (tab === 'Messages') { const r = await adminService.getMessages(); if (r.success) setMessages(r.data); }
    } catch {}
    setLoading(false);
  };

  const handleApprove = async (id) => {
    const r = await adminService.approveListing(id);
    if (r.success) { showToast('Listing approved!', 'success'); loadTab(); }
    else showToast(r.message || 'Failed', 'error');
  };

  const handleReject = async (id, reason) => {
    const r = await adminService.rejectListing(id, reason);
    if (r.success) { showToast('Listing rejected', 'info'); setRejectId(null); loadTab(); }
    else showToast(r.message || 'Failed', 'error');
  };

  const handleOrderStatus = async (id, status) => {
    const r = await adminService.updateOrderStatus(id, status);
    if (r.success) { showToast('Order status updated', 'success'); loadTab(); }
  };

  const StatCard = ({ label, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color || COLORS.accent }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />;

    if (tab === 'Dashboard' && stats) return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard label="Total Users" value={stats.users} icon="👥" color={COLORS.primary} />
          <StatCard label="Total Books" value={stats.books} icon="📚" color={COLORS.accent} />
          <StatCard label="Total Orders" value={stats.orders} icon="📦" color={COLORS.success} />
          <StatCard label="Listings" value={stats.listings} icon="🏪" color="#8b5cf6" />
          <StatCard label="Pending" value={stats.pendingListings} icon="⏳" color={COLORS.warning} />
          <StatCard label="Members" value={stats.paidMemberships} icon="💎" color="#ec4899" />
        </View>
        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueValue}>${parseFloat(stats.totalRevenue || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {stats.recentOrders?.map((o) => (
            <View key={o._id} style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listItemTitle}>{o.orderNumber}</Text>
                <Text style={styles.listItemSub}>{o.name || o.user?.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.listItemPrice}>${parseFloat(o.total).toFixed(2)}</Text>
                <Badge label={o.status} preset={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : 'pending'} size="xs" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );

    if (tab === 'Users') return (
      <FlatList data={users} keyExtractor={(i) => i._id} renderItem={({ item: u }) => (
        <View style={styles.listItem}>
          <View style={styles.userAvatar}><Text style={styles.userInitial}>{u.name?.[0]?.toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle}>{u.name}</Text>
            <Text style={styles.listItemSub}>{u.email}</Text>
            <View style={styles.badgeRow}>
              <Badge label={u.role} preset={u.role === 'admin' ? 'primary' : 'default'} size="xs" />
              <Badge label={u.plan} preset={u.plan === 'ultimate' ? 'accent' : u.plan === 'premium' ? 'primary' : 'default'} size="xs" />
              {u.isBlocked && <Badge label="Blocked" preset="error" size="xs" />}
            </View>
          </View>
          <View style={styles.actionCol}>
            <TouchableOpacity style={styles.smallBtn} onPress={async () => { const r = await adminService.toggleBlockUser(u._id); if (r.success) { showToast(r.data.isBlocked ? 'User blocked' : 'User unblocked', 'info'); loadTab(); } }}>
              <Text style={styles.smallBtnText}>{u.isBlocked ? 'Unblock' : 'Block'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallBtn, styles.smallBtnDanger]} onPress={() => { Alert.alert('Delete User', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await adminService.deleteUser(u._id); loadTab(); } }]); }}>
              <Text style={[styles.smallBtnText, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )} contentContainerStyle={{ padding: SIZES.sm }} />
    );

    if (tab === 'Orders') return (
      <FlatList data={orders} keyExtractor={(i) => i._id} renderItem={({ item: o }) => (
        <View style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle}>{o.orderNumber}</Text>
            <Text style={styles.listItemSub}>{o.shipping?.name} · ${parseFloat(o.total).toFixed(2)}</Text>
            <Badge label={o.status} preset={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : 'pending'} size="xs" style={{ marginTop: 4 }} />
          </View>
          <View style={styles.statusButtons}>
            {['confirmed', 'shipped', 'delivered'].map((s) => (
              <TouchableOpacity key={s} style={[styles.statusBtn, o.status === s && styles.statusBtnActive]} onPress={() => handleOrderStatus(o._id, s)}>
                <Text style={[styles.statusBtnText, o.status === s && { color: COLORS.white }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )} contentContainerStyle={{ padding: SIZES.sm }} />
    );

    if (tab === 'Marketplace') return (
      <FlatList data={listings} keyExtractor={(i) => i._id} renderItem={({ item: l }) => (
        <View style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle}>{l.title}</Text>
            <Text style={styles.listItemSub}>{l.sellerName} · ${parseFloat(l.price).toFixed(2)}</Text>
            <View style={styles.badgeRow}>
              <Badge label={l.status} preset={l.status === 'approved' ? 'approved' : l.status === 'rejected' ? 'rejected' : 'pending'} size="xs" />
              <Badge label={l.listingType} preset={l.listingType === 'sell' ? 'sell' : 'buy'} size="xs" />
            </View>
            {l.status === 'pending' && (
              <View style={styles.approvalButtons}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(l._id)}><Text style={styles.approveBtnText}>✓ Approve</Text></TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => setRejectId(l._id)}><Text style={styles.rejectBtnText}>✕ Reject</Text></TouchableOpacity>
              </View>
            )}
            {rejectId === l._id && (
              <View style={{ marginTop: 8 }}>
                <Input placeholder="Rejection reason..." value={rejectReason} onChangeText={setRejectReason} style={{ marginBottom: 6 }} />
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(l._id, rejectReason)}>
                  <Text style={styles.rejectBtnText}>Confirm Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )} contentContainerStyle={{ padding: SIZES.sm }} />
    );

    if (tab === 'Memberships') return (
      <FlatList data={memberships} keyExtractor={(i) => i._id} renderItem={({ item: m }) => (
        <View style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle}>{m.user?.name}</Text>
            <Text style={styles.listItemSub}>{m.user?.email}</Text>
            <Badge label={m.plan} preset={m.plan === 'ultimate' ? 'accent' : m.plan === 'premium' ? 'primary' : 'default'} size="xs" style={{ marginTop: 4 }} />
          </View>
          <Text style={styles.listItemPrice}>{m.price === 0 ? 'Free' : `$${m.price}/mo`}</Text>
        </View>
      )} contentContainerStyle={{ padding: SIZES.sm }} />
    );

    if (tab === 'Messages') return (
      <FlatList data={messages} keyExtractor={(i) => i._id} renderItem={({ item: m }) => (
        <View style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemTitle}>{m.senderName}</Text>
            <Text style={styles.listItemSub}>{m.listing?.title || `Listing #${m.listing}`}</Text>
            <Text style={styles.msgText} numberOfLines={2}>{m.message}</Text>
          </View>
        </View>
      )} contentContainerStyle={{ padding: SIZES.sm }} />
    );

    return null;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.adminBadge}>⚙️</Text>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={[styles.tabItem, tab === t && styles.tabItemActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ flex: 1 }}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 12 },
  backText: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  adminBadge: { fontSize: 22 },
  tabBar: { paddingHorizontal: SIZES.sm, paddingVertical: 10, gap: 6, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radius.full, backgroundColor: COLORS.secondary },
  tabItemActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONTS.sizes.sm, color: COLORS.muted, fontWeight: FONTS.weights.medium },
  tabTextActive: { color: COLORS.white, fontWeight: FONTS.weights.bold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: SIZES.sm },
  statCard: { width: '50%', padding: 6 },
  statCardInner: { backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, padding: SIZES.md, borderLeftWidth: 4, ...SHADOWS.sm },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.muted, marginTop: 2 },
  revenueCard: { margin: SIZES.md, backgroundColor: COLORS.primary, borderRadius: SIZES.radius.xl, padding: SIZES.xl, alignItems: 'center' },
  revenueLabel: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.7)' },
  revenueValue: { fontSize: 36, fontWeight: FONTS.weights.extrabold, color: COLORS.white, marginTop: 4 },
  section: { paddingHorizontal: SIZES.md, paddingTop: SIZES.md },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SIZES.sm },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, padding: SIZES.md, marginBottom: SIZES.sm, ...SHADOWS.sm },
  listItemTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  listItemSub: { fontSize: FONTS.sizes.xs, color: COLORS.muted, marginTop: 2 },
  listItemPrice: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.accent },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 6 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  userInitial: { color: COLORS.white, fontWeight: FONTS.weights.bold },
  actionCol: { gap: 6 },
  smallBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: SIZES.radius.sm },
  smallBtnDanger: { borderWidth: 1, borderColor: COLORS.error },
  smallBtnText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold, color: COLORS.text },
  statusButtons: { gap: 4 },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: SIZES.radius.sm, backgroundColor: COLORS.secondary, borderWidth: 1, borderColor: COLORS.border },
  statusBtnActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  statusBtnText: { fontSize: 10, fontWeight: FONTS.weights.semibold, color: COLORS.text, textTransform: 'capitalize' },
  approvalButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  approveBtn: { flex: 1, backgroundColor: '#dcfce7', borderRadius: SIZES.radius.sm, padding: 8, alignItems: 'center' },
  approveBtnText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: COLORS.success },
  rejectBtn: { flex: 1, backgroundColor: '#fee2e2', borderRadius: SIZES.radius.sm, padding: 8, alignItems: 'center' },
  rejectBtnText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: COLORS.error },
  msgText: { fontSize: FONTS.sizes.xs, color: COLORS.muted, marginTop: 4, lineHeight: 16 },
});
