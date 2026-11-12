import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';

const TYPE_ICONS = { order: '📦', marketplace: '🏪', membership: '💎', system: '🔔' };

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/notifications/my').then((r) => { if (r.data.success) setNotifications(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}><Text style={styles.markAll}>Mark all read</Text></TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.accent} /> :
        notifications.length === 0 ? <EmptyState icon="🔔" title="No Notifications" subtitle="You're all caught up!" /> :
        <FlatList data={notifications} keyExtractor={(i) => i._id} contentContainerStyle={styles.list} renderItem={({ item: n }) => (
          <TouchableOpacity style={[styles.notifCard, !n.isRead && styles.unread]} onPress={async () => { await api.patch(`/notifications/${n._id}/read`); setNotifications((prev) => prev.map((x) => x._id === n._id ? { ...x, isRead: true } : x)); }}>
            <Text style={styles.icon}>{TYPE_ICONS[n.type] || '🔔'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.notifTitle, !n.isRead && { fontWeight: FONTS.weights.bold }]}>{n.title}</Text>
              <Text style={styles.notifMsg}>{n.message}</Text>
              <Text style={styles.notifTime}>{new Date(n.createdAt).toLocaleDateString()}</Text>
            </View>
            {!n.isRead && <View style={styles.dot} />}
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
  markAll: { fontSize: FONTS.sizes.xs, color: COLORS.accentLight },
  list: { padding: SIZES.md },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, padding: SIZES.md, marginBottom: SIZES.sm, ...SHADOWS.sm },
  unread: { borderLeftWidth: 3, borderLeftColor: COLORS.accent, backgroundColor: '#fdf8f5' },
  icon: { fontSize: 24, marginRight: 12, marginTop: 2 },
  notifTitle: { fontSize: FONTS.sizes.md, color: COLORS.text, marginBottom: 3 },
  notifMsg: { fontSize: FONTS.sizes.sm, color: COLORS.muted, lineHeight: 18 },
  notifTime: { fontSize: FONTS.sizes.xs, color: COLORS.mutedLight, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent, marginTop: 6 },
});
