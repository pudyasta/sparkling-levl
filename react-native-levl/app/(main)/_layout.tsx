import { Tabs, router } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import {
  bookActive, bookInactive, homeActive, homeInactive,
  rankingActive, rankingInactive, userActive, userInactive,
} from '@/assets/images/homeTabIcon';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

function TabIcon({ source, focused }: { source: any; focused: boolean }) {
  return <Image source={source} style={{ width: 28, height: 28 }} resizeMode="contain" />;
}

export default function MainLayout() {
  const { isAuthenticated, isRefreshing } = useNativeBridge();

  useEffect(() => {
    if (!isRefreshing && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isRefreshing]);

  if (!isAuthenticated) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#eeeeee',
          backgroundColor: '#ffffff',
          height: 68,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#9aa0a6',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={focused ? homeActive : homeInactive} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={focused ? bookActive : bookInactive} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={focused ? rankingActive : rankingInactive} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={focused ? userActive : userInactive} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
