import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6fb8d5',
        tabBarLabelStyle: { fontSize: 16, fontWeight: '600' },
        tabBarStyle: { height: 80, paddingBottom: 10 },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '🏠 Home',
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: '📅 Schedule',
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: '❓ Help',
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: '☎️ Call',
        }}
      />
    </Tabs>
  );
}
