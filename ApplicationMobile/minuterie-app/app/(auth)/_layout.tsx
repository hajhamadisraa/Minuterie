import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AuthLayout() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const { path, queryParams } = Linking.parse(url);

      if (path === 'reset-password' && queryParams?.oobCode) {
        router.push({
          pathname: '/(auth)/reset-password', // ✅ chemin correct pour Expo Router
          params: { oobCode: queryParams.oobCode as string },
        });
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
