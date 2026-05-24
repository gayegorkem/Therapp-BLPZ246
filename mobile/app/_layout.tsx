import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateUi = useUiStore((s) => s.hydrate);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const uiHydrated = useUiStore((s) => s.hydrated);

  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    (async () => {
      await Promise.all([hydrateAuth(), hydrateUi()]);
      setBootstrapped(true);
      await SplashScreen.hideAsync().catch(() => {});
    })();
  }, [hydrateAuth, hydrateUi]);

  if (!bootstrapped || !authHydrated || !uiHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGate />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AuthGate() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasOnboarded = useUiStore((s) => s.hasOnboarded);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const onOnboarding = segments[0] === 'onboarding';

    if (!hasOnboarded && !onOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (hasOnboarded && !isAuthenticated && !inAuthGroup && !onOnboarding) {
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated && (inAuthGroup || onOnboarding)) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, hasOnboarded, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="post/[id]" />
      <Stack.Screen name="post/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="category/[slug]" />
      <Stack.Screen name="report" options={{ presentation: 'modal' }} />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
