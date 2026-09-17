import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, theme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const resolvedTheme = colorScheme === 'light' ? 'light' : 'dark';
  const palette = Colors[resolvedTheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.tint,
        tabBarInactiveTintColor: '#8A96B8',
        tabBarStyle: {
          backgroundColor: theme.colors.secondary,
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: 62 + Math.max(insets.bottom, 10),
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="direct"
        options={{
          title: 'Direct',
          tabBarIcon: ({ color, size }) => <Ionicons name="radio" size={size} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="emissions"
        options={{
          title: 'Émissions',
          tabBarIcon: ({ color, size }) => <Ionicons name="play-circle" size={size} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="replays"
        options={{
          title: 'Replays',
          tabBarIcon: ({ color, size }) => <Ionicons name="albums" size={size} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
