import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 12 },
        headerShown: true,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="lighting" options={{ title: 'Lighting' }} />
      <Tabs.Screen name="irrigation" options={{ title: 'Irrigation' }} />
      <Tabs.Screen name="bell-normal" options={{ title: 'Bell Normal' }} />
      <Tabs.Screen name="bell-special" options={{ title: 'Bell Special' }} />
    </Tabs>
  );
}
