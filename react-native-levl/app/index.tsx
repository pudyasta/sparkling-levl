import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import AppLoading from '@/components/AppLoading';

export default function Index() {
  const { hydrated, isAuthenticated } = useAuth();

  if (!hydrated) return <AppLoading fullScreen />;

  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />;
}
