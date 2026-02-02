import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { 
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      {/* Dashboard */}
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }} 
      />
      
      {/* Lighting */}
      <Tabs.Screen 
        name="lighting" 
        options={{ 
          title: 'Lighting',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'bulb' : 'bulb-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }} 
      />
      
      {/* Irrigation */}
      <Tabs.Screen 
        name="irrigation" 
        options={{ 
          title: 'Irrigation',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'water' : 'water-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }} 
      />
      
      {/* Bell */}
      <Tabs.Screen 
        name="bell" 
        options={{ 
          title: 'Bell',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'notifications' : 'notifications-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }} 
      />

      {/* Manage Users - NOUVELLE ICÔNE ICI */}
      <Tabs.Screen 
        name="ManageUsers" 
        options={{ 
          title: 'ManageUsers',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'people' : 'people-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }} 
      />
    </Tabs>
  );
}