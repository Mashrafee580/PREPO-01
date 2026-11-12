import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import Button from './Button';

export default function EmptyState({ icon = '📚', title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} style={styles.btn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl },
  icon: { fontSize: 56, marginBottom: SIZES.md },
  title: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text, textAlign: 'center', marginBottom: SIZES.sm },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: SIZES.lg },
  btn: { marginTop: SIZES.sm },
});
