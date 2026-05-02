import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppProvider from '@/context/AppProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="course-detail" />
          <Stack.Screen name="lessons" />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="quiz-result" />
          <Stack.Screen name="my-courses" />
        </Stack>
        <StatusBar style="auto" />
      </AppProvider>
    </SafeAreaProvider>
  );
}
