import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AppState, Platform } from 'react-native';
import { AuthProvider, useAuth } from "../hooks/useAuth";
import Toast from 'react-native-toast-message';
import { registerForPushNotificationsAsync } from '../services/notifications';
import api from '../api/api';

const AuthLayout = () => {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments.length > 0 && segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  useEffect(() => {
    if (user && Platform.OS !== 'web') {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          console.log('Send this token to your server:', token);
          api.post('/users/push-token', { token });
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // 首次加载时确认一次
      api.post('/users/confirm-awake');

      const subscription = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          console.log('App has come to the foreground, confirming awake status.');
          api.post('/users/confirm-awake');
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, [user]);

  if (loading) return null;
  return (
    <Stack>
      {/* <Stack.Screen name="(auth)" options={{ title: '欢迎' }} /> */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthLayout />
      <Toast />
    </AuthProvider>
  );
}
