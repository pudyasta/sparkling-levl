import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { AppProvider } from '../src/context/AppProvider';
import '../src/global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('../src/assets/fonts/inter.ttf'),
    PlusJakartaSans: require('../src/assets/fonts/Jakarta.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen name="course-detail" options={{ headerShown: false }} />
          <Stack.Screen name="lessons" options={{ headerShown: false }} />
          <Stack.Screen name="quiz" options={{ headerShown: false }} />
          <Stack.Screen name="quiz-result" options={{ headerShown: false }} />
          <Stack.Screen name="my-courses" options={{ headerShown: false }} />
          <Stack.Screen name="profile-settings" options={{ headerShown: false }} />
        </Stack>
        <Toast />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
