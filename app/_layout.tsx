import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserLibraryProvider } from '@/hooks/use-user-library';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <UserLibraryProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="video/[videoId]" options={{ headerShown: false }} />
            <Stack.Screen name="emission/[slug]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </UserLibraryProvider>
    </SafeAreaProvider>
  );
}
