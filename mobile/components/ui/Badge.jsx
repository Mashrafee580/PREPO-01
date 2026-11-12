import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const presets = {
  default: { bg: COLORS.secondary, text: COLORS.text },
  primary: { bg: COLORS.primary, text: COLORS.white },
  accent: { bg: COLORS.accent, text: COLORS.white },
  success: { bg: '#dcfce7', text: COLORS.success },
  warning: { bg: '#fef9c3', text: COLORS.warning },
  error: { bg: '#fee2e2', text: COLORS.error },
  pending: { bg: '#fef9c3', text: '#92400e' },
  approved: { bg: '#dcfce7', text: '#166534' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
  sell: { bg: '#dbeafe', text: '#1d4ed8' },
  buy: { bg: '#fce7f3', text: '#be185d' },
};

export default function Badge({ label, preset = 'default', style, textStyle, size = 'sm' }) {
  const p = presets[preset] || presets.default;
  return (
    <View style={[styles.badge, { backgroundColor: p.bg }, size === 'xs' && styles.xs, style]}>
      <Text style={[styles.text, { color: p.text }, size === 'xs' && styles.xsText, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radius.full, alignSelf: 'flex-start' },
  text: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold, letterSpacing: 0.3 },
  xs: { paddingHorizontal: 6, paddingVertical: 2 },
  xsText: { fontSize: 10 },
});
