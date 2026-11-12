import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { marketplaceService } from '../../services/marketplaceService';
import { useAuthStore } from '../../context/authStore';
import { useToastStore } from '../../context/toastStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactModal, setContactModal] = useState(false);
  const [contact, setContact] = useState({ name: user?.name || '', email: user?.email || '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    marketplaceService.getListing(id).then((r) => { if (r.success) setListing(r.data); setLoading(false); });
  }, [id]);

  const handleContact = async () => {
    if (!contact.name || !contact.email || !contact.message) { showToast('All fields required', 'error'); return; }
    setSending(true);
    try {
      const res = await marketplaceService.contactSeller(id, { senderName: contact.name, senderEmail: contact.email, message: contact.message });
      if (res.success) { setContactModal(false); showToast('Message sent to seller!', 'success'); }
      else showToast(res.message || 'Failed to send', 'error');
    } catch (err) { showToast(err.message || 'Failed to send', 'error'); }
    setSending(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
  if (!listing) return <View style={styles.center}><Text>Listing not found</Text></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{listing.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: listing.coverUrl || 'https://via.placeholder.com/400x250?text=📚' }} style={styles.cover} resizeMode="cover" />

        <View style={styles.infoSection}>
          <View style={styles.badgeRow}>
            <Badge label={listing.listingType === 'sell' ? 'Want to Sell' : 'Want to Buy'} preset={listing.listingType} />
            <Badge label={listing.condition} preset="default" />
            <Badge label={listing.category} preset="default" />
          </View>

          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.author}>by {listing.author}</Text>
          <Text style={styles.price}>${parseFloat(listing.price).toFixed(2)}</Text>

          {listing.description ? (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>Description</Text>
              <Text style={styles.desc}>{listing.description}</Text>
            </View>
          ) : null}

          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}><Text style={styles.sellerInitial}>{listing.sellerName?.[0]?.toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>{listing.sellerName}</Text>
              {listing.location ? <Text style={styles.sellerLoc}>📍 {listing.location}</Text> : null}
            </View>
          </View>

          <Button
            title={listing.listingType === 'sell' ? 'Contact Seller' : 'Make an Offer'}
            onPress={() => {
              if (!user) { router.push('/auth/login'); return; }
              setContactModal(true);
            }}
            fullWidth size="lg" style={{ marginTop: SIZES.md }}
          />
        </View>
      </ScrollView>

      {/* Contact Modal */}
      <Modal visible={contactModal} onClose={() => setContactModal(false)} title={listing.listingType === 'sell' ? 'Contact Seller' : 'Make an Offer'} scrollable>
        <Text style={styles.contactSub}>"{listing.title}" · ${parseFloat(listing.price).toFixed(2)}</Text>
        <Input label="Your Name" value={contact.name} onChangeText={(v) => setContact((c) => ({ ...c, name: v }))} autoCapitalize="words" />
        <Input label="Your Email" value={contact.email} onChangeText={(v) => setContact((c) => ({ ...c, email: v }))} keyboardType="email-address" />
        <Input label="Message" value={contact.message} onChangeText={(v) => setContact((c) => ({ ...c, message: v }))} placeholder="Write your message..." multiline numberOfLines={4} />
        <Button title="Send Message" onPress={handleContact} loading={sending} fullWidth style={{ marginTop: SIZES.sm, marginBottom: SIZES.md }} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 12 },
  backText: { fontSize: 22, color: COLORS.white },
  headerTitle: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.white, textAlign: 'center' },
  cover: { width: '100%', height: 240, backgroundColor: COLORS.secondary },
  infoSection: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: SIZES.xl },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: SIZES.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text, marginBottom: 6 },
  author: { fontSize: FONTS.sizes.md, color: COLORS.muted, marginBottom: SIZES.md },
  price: { fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.extrabold, color: COLORS.accent, marginBottom: SIZES.md },
  descSection: { marginBottom: SIZES.md },
  descTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 6 },
  desc: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 24 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: SIZES.radius.lg, padding: SIZES.md },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sellerInitial: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  sellerName: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  sellerLoc: { fontSize: FONTS.sizes.xs, color: COLORS.muted, marginTop: 2 },
  contactSub: { fontSize: FONTS.sizes.sm, color: COLORS.muted, marginBottom: SIZES.md },
});
