import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

export function Skeleton({ width, height, borderRadius = SIZES.radius.md, style }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[{ width, height, borderRadius, backgroundColor: '#e0dbd5', opacity: anim }, style]} />
  );
}

export function BookCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={160} borderRadius={SIZES.radius.md} />
      <View style={{ padding: 10 }}>
        <Skeleton width="80%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={16} />
      </View>
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <Skeleton width={70} height={100} borderRadius={SIZES.radius.sm} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="90%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, overflow: 'hidden', width: 160 },
  listItem: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: SIZES.radius.lg, padding: 12, marginBottom: 12 },
});
