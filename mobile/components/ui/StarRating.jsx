import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function StarRating({ rating = 0, maxStars = 5, size = 16, editable = false, onRate, showCount, count = 0 }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <TouchableOpacity key={i} onPress={editable ? () => onRate(i + 1) : undefined} disabled={!editable}>
            <Text style={{ fontSize: size, color: filled || half ? '#f59e0b' : '#d1ccc5' }}>
              {filled ? '★' : half ? '½' : '☆'}
            </Text>
          </TouchableOpacity>
        );
      })}
      {showCount && <Text style={[styles.count, { fontSize: size * 0.75 }]}>({count})</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  count: { color: COLORS.muted, marginLeft: 4 },
});
