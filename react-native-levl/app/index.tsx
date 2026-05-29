import { Redirect } from 'expo-router';

import { useNativeBridge } from '../src/context/NativeBridgeProvider';

export default function Index() {
  const { isAuthenticated } = useNativeBridge();
  if (isAuthenticated) {
    return <Redirect href="/(main)/home" />;
  }
  return <Redirect href="/(auth)/login" />;
}
