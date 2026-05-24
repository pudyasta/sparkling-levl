import React, { useState } from 'react';
import { ActivityIndicator, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '@/constant/style';

interface ButtonProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'white';
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  rounded?: boolean;
  isLoading?: boolean;
  style?: object;
}

const Button = ({
  children,
  color = 'primary',
  variant = 'filled',
  onPress,
  disabled = false,
  size = 'medium',
  rounded = false,
  isLoading = false,
  style,
}: ButtonProps) => {
  const [pressed, setPressed] = useState(false);

  const theme: Record<string, string> = {
    primary: Colors.Primary,
    secondary: Colors.Secondary,
    white: '#FFFFFF',
  };

  const paddingV = size === 'small' ? 8 : size === 'medium' ? 12 : 16;

  const getStyles = () => {
    if (disabled) {
      return {
        bg: '#F5F5F5',
        border: Colors.Disabled,
        text: Colors.Disabled,
      };
    }
    const base = theme[color];
    if (variant === 'filled') {
      return {
        bg: base,
        border: base,
        text: color === 'primary' ? '#FFFFFF' : '#000000',
      };
    }
    return {
      bg: 'transparent',
      border: base,
      text: color === 'white' ? '#FFFFFF' : base,
    };
  };

  const { bg, border, text } = getStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        {
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: paddingV,
          borderRadius: rounded ? 999 : 12,
          borderWidth: 1,
          backgroundColor: bg,
          borderColor: border,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={text} size="small" />
      ) : typeof children === 'string' ? (
        <Text style={{ color: text, fontWeight: '700', fontSize: 15 }}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export default Button;
