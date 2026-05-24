import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constant/style';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Colors.SuccessBadgeBg, text: Colors.SuccessBadgeText },
  warning: { bg: Colors.WarningBadgeBg, text: Colors.WarningBadgeText },
  danger: { bg: Colors.DangerBadgeBg, text: Colors.DangerBadgeText },
  info: { bg: Colors.InfoBadgeBg, text: Colors.InfoBadgeText },
  neutral: { bg: Colors.NeutralBadgeBg, text: Colors.NeutralBadgeText },
};

const Badge: React.FC<{ variant?: BadgeVariant; children: React.ReactNode }> = ({
  variant = 'neutral',
  children,
}) => {
  const vs = VARIANT_STYLES[variant];
  return (
    <View style={{ backgroundColor: vs.bg, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color: vs.text, fontSize: 11, fontWeight: '600' }}>{children}</Text>
    </View>
  );
};

export default Badge;
