import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import CoursesScreen from '@/screens/main/CoursesScreen';
import HomeScreen from '@/screens/main/HomeScreen';
import LeaderboardScreen from '@/screens/main/LeaderboardScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';
import { Colors } from '@/constant/colors';
import type { MainTabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<string, { active: string; inactive: string }> = {
  Home: { active: '🏠', inactive: '🏡' },
  Courses: { active: '📚', inactive: '📖' },
  Leaderboard: { active: '🏆', inactive: '🥈' },
  Profile: { active: '👤', inactive: '👥' },
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icons = tabIcons[route.name] ?? { active: '●', inactive: '○' };
          return (
            <Text style={{ fontSize: 20 }}>
              {focused ? icons.active : icons.inactive}
            </Text>
          );
        },
        tabBarActiveTintColor: Colors.Primary,
        tabBarInactiveTintColor: Colors.Disabled,
        tabBarStyle: {
          backgroundColor: Colors.Background,
          borderTopColor: '#E8F0FE',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Courses" component={CoursesScreen} options={{ tabBarLabel: 'Courses' }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarLabel: 'Ranking' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
