import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { useCartStore } from '../../context/cartStore';

function TabIcon({ icon, label, focused }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{icon}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

function CartTabIcon({ focused }) {
  const count = useCartStore((s) => s.getCount());
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <View>
        <Text style={[styles.icon, focused && styles.iconActive]}>🛒</Text>
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.label, focused && styles.labelActive]}>Cart</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="books" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📚" label="Books" focused={focused} /> }} />
      <Tabs.Screen name="marketplace" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏪" label="Market" focused={focused} /> }} />
      <Tabs.Screen name="cart" options={{ tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border, height: 72, paddingBottom: 8 },
  tabItem: { alignItems: 'center', justifyContent: 'center', paddingTop: 8, paddingHorizontal: 8 },
  tabItemActive: {},
  icon: { fontSize: 22, marginBottom: 2 },
  iconActive: {},
  label: { fontSize: 10, color: COLORS.muted, fontWeight: FONTS.weights.medium },
  labelActive: { color: COLORS.primary, fontWeight: FONTS.weights.bold },
  badge: { position: 'absolute', top: -4, right: -8, backgroundColor: COLORS.accent, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: FONTS.weights.bold },
});
