import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const variants = {
  primary: { bg: COLORS.primary, text: COLORS.white, border: COLORS.primary },
  secondary: { bg: COLORS.secondary, text: COLORS.primary, border: COLORS.border },
  accent: { bg: COLORS.accent, text: COLORS.white, border: COLORS.accent },
  outline: { bg: 'transparent', text: COLORS.primary, border: COLORS.primary },
  ghost: { bg: 'transparent', text: COLORS.primary, border: 'transparent' },
  danger: { bg: COLORS.error, text: COLORS.white, border: COLORS.error },
};

const sizes = {
  sm: { px: 12, py: 8, fontSize: FONTS.sizes.sm, radius: SIZES.radius.sm },
  md: { px: 20, py: 13, fontSize: FONTS.sizes.md, radius: SIZES.radius.md },
  lg: { px: 28, py: 16, fontSize: FONTS.sizes.lg, radius: SIZES.radius.lg },
};

export default function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle, icon, fullWidth = false,
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.border, paddingHorizontal: s.px, paddingVertical: s.py, borderRadius: s.radius },
        fullWidth && { width: '100%' },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconWrap: { marginRight: 8 },
  text: { fontWeight: FONTS.weights.semibold, letterSpacing: 0.3 },
  disabled: { opacity: 0.5 },
});
