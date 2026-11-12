import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../context/authStore';
import { useToastStore } from '../../context/toastStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { PLAN_FEATURES } from '../../constants/api';
import api from '../../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const showToast = useToastStore((s) => s.show);
  const [membership, setMembership] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/memberships/my').then((r) => { if (r.data.success) setMembership(r.data.data); }).catch(() => {});
      api.get('/notifications/my').then((r) => {
        if (r.data.success) {
          setNotifications(r.data.data.slice(0, 5));
          setUnreadCount(r.data.data.filter((n) => !n.isRead).length);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'info');
  };

  const planPreset = { free: 'default', premium: 'primary', ultimate: 'accent' };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}><Text style={styles.headerTitle}>Profile</Text></View>
        <View style={styles.guestContainer}>
          <Text style={styles.guestIcon}>👤</Text>
          <Text style={styles.guestTitle}>Sign in to your account</Text>
          <Text style={styles.guestSub}>Access your orders, wishlist, and membership benefits</Text>
          <Button title="Sign In" onPress={() => router.push('/auth/login')} size="lg" style={{ marginBottom: 12 }} />
          <Button title="Create Account" onPress={() => router.push('/auth/register')} variant="outline" size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  const plan = membership?.plan || user?.plan || 'free';
  const planInfo = PLAN_FEATURES[plan];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}><Text style={styles.headerTitle}>Profile</Text></View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            {user?.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase()}</Text></View>}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Badge label={plan.charAt(0).toUpperCase() + plan.slice(1)} preset={planPreset[plan] || 'default'} style={{ marginTop: 6 }} />
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/profile/edit')}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Membership Card */}
        <TouchableOpacity style={[styles.memberCard, { borderColor: plan === 'ultimate' ? COLORS.accent : plan === 'premium' ? COLORS.primary : COLORS.border }]} onPress={() => {}}>
          <View>
            <Text style={styles.memberTitle}>📖 {planInfo?.name} Plan</Text>
            <Text style={styles.memberPrice}>{plan === 'free' ? 'Free forever' : `$${planInfo?.price}/month`}</Text>
          </View>
          {plan === 'free' && <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/profile/membership')}><Text style={styles.upgradeBtnText}>Upgrade →</Text></TouchableOpacity>}
        </TouchableOpacity>

        {/* Notifications */}
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.notifBanner}>
            <Text style={styles.notifText}>🔔 You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {[
            { icon: '📦', label: 'My Orders', onPress: () => router.push('/profile/orders') },
            { icon: '🏪', label: 'My Listings', onPress: () => router.push('/profile/listings') },
            { icon: '❤️', label: 'Wishlist', onPress: () => router.push('/profile/wishlist') },
            { icon: '💳', label: 'Membership', onPress: () => router.push('/profile/membership') },
            { icon: '🔔', label: 'Notifications', onPress: () => router.push('/profile/notifications'), badge: unreadCount > 0 ? unreadCount : null },
            { icon: '🔒', label: 'Change Password', onPress: () => router.push('/profile/change-password') },
            ...(user?.role === 'admin' ? [{ icon: '⚙️', label: 'Admin Panel', onPress: () => router.push('/admin') }] : []),
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <View style={styles.menuRight}>
                {item.badge && <View style={styles.menuBadge}><Text style={styles.menuBadgeText}>{item.badge}</Text></View>}
                <Text style={styles.menuArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.aboutItem} onPress={() => router.push('/about')}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={styles.menuLabel}>About PaperTrail</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={{ paddingHorizontal: SIZES.md, paddingBottom: SIZES.xxl, marginTop: SIZES.md }}>
          <Button title="Logout" onPress={handleLogout} variant="outline" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.white },
  guestContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl },
  guestIcon: { fontSize: 72, marginBottom: SIZES.md },
  guestTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SIZES.sm, textAlign: 'center' },
  guestSub: { fontSize: FONTS.sizes.md, color: COLORS.muted, textAlign: 'center', marginBottom: SIZES.xl, lineHeight: 22 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, marginHorizontal: SIZES.md, marginTop: SIZES.md, borderRadius: SIZES.radius.xl, padding: SIZES.md, ...SHADOWS.md },
  avatarWrap: { marginRight: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold, color: COLORS.white },
  userInfo: { flex: 1 },
  userName: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  userEmail: { fontSize: FONTS.sizes.sm, color: COLORS.muted, marginTop: 2 },
  editBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: SIZES.radius.full },
  editBtnText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text },
  memberCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, marginHorizontal: SIZES.md, marginTop: SIZES.md, borderRadius: SIZES.radius.xl, padding: SIZES.md, borderWidth: 2, ...SHADOWS.sm },
  memberTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  memberPrice: { fontSize: FONTS.sizes.sm, color: COLORS.muted, marginTop: 2 },
  upgradeBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: SIZES.radius.full },
  upgradeBtnText: { color: COLORS.white, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm },
  notifBanner: { backgroundColor: '#fef9c3', marginHorizontal: SIZES.md, marginTop: SIZES.md, borderRadius: SIZES.radius.md, padding: SIZES.sm, borderLeftWidth: 4, borderLeftColor: COLORS.warning },
  notifText: { fontSize: FONTS.sizes.sm, color: '#92400e', fontWeight: FONTS.weights.medium },
  menuSection: { backgroundColor: COLORS.card, marginHorizontal: SIZES.md, marginTop: SIZES.md, borderRadius: SIZES.radius.xl, overflow: 'hidden', ...SHADOWS.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.md, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  aboutItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.md + 4, paddingVertical: 16, backgroundColor: COLORS.card, marginHorizontal: SIZES.md, marginTop: SIZES.md, borderRadius: SIZES.radius.xl, ...SHADOWS.sm },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: FONTS.weights.medium },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge: { backgroundColor: COLORS.accent, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  menuBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: FONTS.weights.bold },
  menuArrow: { fontSize: 20, color: COLORS.muted },
});
