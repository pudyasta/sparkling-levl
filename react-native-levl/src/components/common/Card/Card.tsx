import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors } from '@/constant/style';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: object;
  bindTap?: () => void;
}

const Card: React.FC<CardProps> = ({ children, style, bindTap }) => {
  if (bindTap) {
    return (
      <TouchableOpacity
        onPress={bindTap}
        activeOpacity={0.8}
        style={[styles.card, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.Surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.Border,
    overflow: 'hidden',
  },
});

export default Card;
