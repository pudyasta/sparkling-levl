import { ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constant/colors';

interface AppLoadingProps {
  size?: number | 'small' | 'large';
  fullScreen?: boolean;
}

export default function AppLoading({ size = 'large', fullScreen = false }: AppLoadingProps) {
  if (fullScreen) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size={size} color={Colors.Primary} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={Colors.Primary} />;
}
