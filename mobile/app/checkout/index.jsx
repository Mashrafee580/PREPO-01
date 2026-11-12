import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useCartStore } from '../../context/cartStore';
import { useAuthStore } from '../../context/authStore';
import { useToastStore } from '../../context/toastStore';
import { orderService } from '../../services/orderService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, deliveryOption, getSubtotal, getTotal, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);

  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '',
    phone: user?.phone || '', address: user?.address?.street || '',
    city: user?.address?.city || '', zip: user?.address?.zip || '',
  });
  const [payMethod, setPayMethod] = useState('card');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', holder: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.zip.trim()) e.zip = 'Required';
    if (payMethod === 'card') {
      if (!cardForm.holder.trim()) e.holder = 'Required';
      if (!/^\d{16}$/.test(cardForm.number.replace(/\s/g, ''))) e.cardNumber = 'Enter valid 16-digit card number';
      if (!/^\d{2}\/\d{2}$/.test(cardForm.expiry)) e.expiry = 'Use MM/YY format';
      if (!/^\d{3,4}$/.test(cardForm.cvv)) e.cvv = 'Enter valid CVV';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) { showToast('Please fill in all required fields', 'error'); return; }
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({ book: i._id, qty: i.qty }));
      const res = await orderService.createOrder(
        orderItems,
        { name: form.name, email: form.email, phone: form.phone, address: form.address, city: form.city, zip: form.zip },
        { type: deliveryOption.id, cost: deliveryOption.price }
      );
      if (res.success) {
        clearCart();
        showToast('Order placed successfully! 🎉', 'success');
        router.replace(`/orders/${res.data._id}`);
      } else {
        showToast(res.message || 'Order failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Order failed', 'error');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
          {/* Shipping Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📦 Shipping Details</Text>
            <Input label="Full Name" placeholder="John Doe" value={form.name} onChangeText={(v) => setField('name', v)} error={errors.name} autoCapitalize="words" />
            <Input label="Email" placeholder="email@example.com" value={form.email} onChangeText={(v) => setField('email', v)} keyboardType="email-address" error={errors.email} />
            <Input label="Phone Number" placeholder="+1 234 567 8900" value={form.phone} onChangeText={(v) => setField('phone', v)} keyboardType="phone-pad" error={errors.phone} />
            <Input label="Street Address" placeholder="123 Main Street" value={form.address} onChangeText={(v) => setField('address', v)} autoCapitalize="words" error={errors.address} />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input label="City" placeholder="New York" value={form.city} onChangeText={(v) => setField('city', v)} autoCapitalize="words" error={errors.city} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="ZIP Code" placeholder="10001" value={form.zip} onChangeText={(v) => setField('zip', v)} keyboardType="numeric" error={errors.zip} />
              </View>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💳 Payment Method</Text>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity key={m.id} style={[styles.payOption, payMethod === m.id && styles.payOptionActive]} onPress={() => setPayMethod(m.id)}>
                <View style={[styles.radio, payMethod === m.id && styles.radioActive]}>
                  {payMethod === m.id && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.payIcon}>{m.icon}</Text>
                <Text style={[styles.payLabel, payMethod === m.id && { color: COLORS.primary }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}

            {payMethod === 'card' && (
              <View style={styles.cardFormWrap}>
                <View style={styles.mockBadge}><Text style={styles.mockText}>🔒 Mock Payment — No real charges</Text></View>
                <Input label="Cardholder Name" placeholder="Name on card" value={cardForm.holder} onChangeText={(v) => setCardForm((f) => ({ ...f, holder: v }))} autoCapitalize="words" error={errors.holder} />
                <Input
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={cardForm.number}
                  onChangeText={(v) => {
                    const cleaned = v.replace(/\D/g, '').slice(0, 16);
                    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
                    setCardForm((f) => ({ ...f, number: formatted }));
                  }}
                  keyboardType="numeric"
                  error={errors.cardNumber}
                />
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Input
                      label="Expiry"
                      placeholder="MM/YY"
                      value={cardForm.expiry}
                      onChangeText={(v) => {
                        let c = v.replace(/\D/g, '').slice(0, 4);
                        if (c.length >= 3) c = c.slice(0, 2) + '/' + c.slice(2);
                        setCardForm((f) => ({ ...f, expiry: c }));
                      }}
                      keyboardType="numeric"
                      error={errors.expiry}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="CVV" placeholder="123" value={cardForm.cvv} onChangeText={(v) => setCardForm((f) => ({ ...f, cvv: v.replace(/\D/g, '').slice(0, 4) }))} keyboardType="numeric" secureTextEntry error={errors.cvv} />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Order Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧾 Order Summary</Text>
            {items.map((item) => (
              <View key={item._id} style={styles.summaryItem}>
                <Text style={styles.summaryItemName} numberOfLines={1}>{item.title} ×{item.qty}</Text>
                <Text style={styles.summaryItemPrice}>${(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryVal}>${getSubtotal().toFixed(2)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery ({deliveryOption.label})</Text><Text style={styles.summaryVal}>{deliveryOption.price === 0 ? 'Free' : `$${deliveryOption.price.toFixed(2)}`}</Text></View>
            <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalVal}>${getTotal().toFixed(2)}</Text></View>
          </View>

          <Button title={`Place Order — $${getTotal().toFixed(2)}`} onPress={handlePlaceOrder} loading={loading} fullWidth size="lg" style={{ marginBottom: SIZES.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 12 },
  backText: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.white },
  container: { padding: SIZES.md, gap: SIZES.md },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius.xl, padding: SIZES.md, ...SHADOWS.sm },
  cardTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SIZES.md },
  row: { flexDirection: 'row' },
  payOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: SIZES.radius.md, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 8 },
  payOptionActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}08` },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  payIcon: { fontSize: 20, marginRight: 10 },
  payLabel: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium, color: COLORS.text },
  cardFormWrap: { marginTop: SIZES.sm, paddingTop: SIZES.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  mockBadge: { backgroundColor: '#fef9c3', borderRadius: SIZES.radius.sm, padding: 10, marginBottom: SIZES.sm },
  mockText: { fontSize: FONTS.sizes.xs, color: '#92400e', textAlign: 'center' },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryItemName: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.text, marginRight: 10 },
  summaryItemPrice: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: FONTS.sizes.sm, color: COLORS.muted },
  summaryVal: { fontSize: FONTS.sizes.sm, color: COLORS.text },
  totalRow: { paddingTop: 10 },
  totalLabel: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  totalVal: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold, color: COLORS.accent },
});
