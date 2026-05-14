import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constant/style';

interface LoadingProps {
  size?: number | 'small' | 'large';
  color?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'small', color = Colors.Primary }) => (
  <ActivityIndicator size={typeof size === 'number' ? 'small' : size} color={color} />
);
