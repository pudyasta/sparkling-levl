import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type ViewStyle } from 'react-native';

import { Colors } from '@/constant/colors';

interface AppButtonProps {
  children?: React.ReactNode;
  label?: string;
  color?: 'primary' | 'secondary' | 'white';
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  rounded?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
}

export default function AppButton({
  children,
  label,
  color = 'primary',
  variant = 'filled',
  onPress,
  disabled = false,
  size = 'medium',
  rounded = false,
  isLoading = false,
  style,
}: AppButtonProps) {
  const colorMap = {
    primary: Colors.Primary,
    secondary: Colors.Secondary,
    white: '#FFFFFF',
  };

  const baseColor = colorMap[color];
  const paddingVertical = size === 'small' ? 8 : size === 'medium' ? 14 : 20;

  const bgColor = disabled
    ? '#F5F5F5'
    : variant === 'filled'
    ? baseColor
    : 'transparent';

  const borderColor = disabled ? Colors.Disabled : baseColor;
  const textColor = disabled
    ? Colors.Disabled
    : variant === 'filled'
    ? color === 'primary'
      ? '#FFFFFF'
      : '#000000'
    : baseColor;

  return (
    <TouchableOpacity
      onPress={disabled || isLoading ? undefined : onPress}
      activeOpacity={0.7}
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          borderColor,
          borderRadius: rounded ? 999 : 12,
          paddingVertical,
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ color: textColor, fontWeight: '700', textAlign: 'center', fontSize: 15 }}>
          {children ?? label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
