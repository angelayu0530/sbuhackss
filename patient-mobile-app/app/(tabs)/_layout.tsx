import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#5cc9b1',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: { fontSize: 20, fontWeight: '700' },
        tabBarStyle: {
          height: 90,
          paddingBottom: 15,
          paddingTop: 10,
          backgroundColor: '#ffffff',
          borderTopWidth: 3,
          borderTopColor: '#5cc9b1',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '🏠 Home',
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: ' 📞 Emergency',
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          href: null, // Hide from tabs
        }}
      />
    </Tabs>
  );
}