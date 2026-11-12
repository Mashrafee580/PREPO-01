import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../context/authStore';
import { useCartStore } from '../context/cartStore';
import ToastContainer from '../components/ui/Toast';

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const loadCart = useCartStore((s) => s.loadCart);

  useEffect(() => {
    initialize();
    loadCart();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="books/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="marketplace/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="marketplace/create" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth/login" options={{ presentation: 'card' }} />
          <Stack.Screen name="auth/register" options={{ presentation: 'card' }} />
          <Stack.Screen name="checkout/index" options={{ presentation: 'card' }} />
          <Stack.Screen name="orders/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile/orders" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile/wishlist" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile/edit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="admin/index" options={{ presentation: 'card' }} />
          <Stack.Screen name="about" options={{ presentation: 'card' }} />
        </Stack>
        <ToastContainer />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
