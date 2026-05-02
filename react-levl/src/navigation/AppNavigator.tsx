import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import CourseDetailScreen from '@/screens/CourseDetailScreen';
import LessonsScreen from '@/screens/LessonsScreen';
import MyCoursesScreen from '@/screens/MyCoursesScreen';
import QuizResultScreen from '@/screens/QuizResultScreen';
import QuizScreen from '@/screens/QuizScreen';
import EmailConfirmationScreen from '@/screens/auth/EmailConfirmationScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import MainTabNavigator from './MainTabNavigator';
import type { RootStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationRegistrar() {
  const { setNavigateToLogin } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    setNavigateToLogin(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    });
  }, [navigation, setNavigateToLogin]);

  return null;
}

export default function AppNavigator() {
  const { hydrated, isAuthenticated, isRefreshing } = useAuth();

  if (!hydrated || isRefreshing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="EmailConfirmation" component={EmailConfirmationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigatorWithRegistrar} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="Lessons" component={LessonsScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResult" component={QuizResultScreen} />
      <Stack.Screen name="MyCourses" component={MyCoursesScreen} />
    </Stack.Navigator>
  );
}

function MainTabNavigatorWithRegistrar() {
  return (
    <>
      <NavigationRegistrar />
      <MainTabNavigator />
    </>
  );
}
