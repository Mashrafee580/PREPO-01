import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useToastStore } from '../../context/toastStore';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

const typeStyles = {
  success: { bg: COLORS.success, icon: '✓' },
  error: { bg: COLORS.error, icon: '✕' },
  warning: { bg: COLORS.warning, icon: '!' },
  info: { bg: COLORS.primary, icon: 'i' },
};

function ToastItem({ toast }) {
  const t = typeStyles[toast.type] || typeStyles.info;
  return (
    <View style={[styles.toast, { backgroundColor: t.bg }]}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{t.icon}</Text>
      </View>
      <Text style={styles.msg} numberOfLines={2}>{toast.message}</Text>
    </View>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 60, left: 16, right: 16, zIndex: 9999 },
  toast: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: SIZES.radius.lg, marginBottom: 8, ...SHADOWS.lg },
  iconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  icon: { color: COLORS.white, fontSize: 12, fontWeight: FONTS.weights.bold },
  msg: { flex: 1, color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium },
});
