import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { FontFamily, TextType, type TypographyProps } from './types';

const FONT_SIZES: Record<string, number> = {
  display: 32, h1: 24, h2: 20, h3: 18,
  b1: 16, b2: 14, b3: 12, p: 13,
};

const LINE_HEIGHTS: Record<string, number> = {
  display: 40, h1: 32, h2: 28, h3: 26,
  b1: 24, b2: 20, b3: 18, p: 20,
};

const HEADING_SIZES = new Set([TextType.display, TextType.h1, TextType.h2, TextType.h3]);

const Text = ({
  fontWeight = 'normal',
  children,
  color,
  disabled = false,
  fontFamily,
  onClick,
  size,
  className = '',
  style = {},
  numberOfLines,
  typeof: typeofProp,
}: TypographyProps) => {
  const resolvedSize = size ?? typeofProp;
  const resolvedFamily =
    fontFamily !== undefined
      ? fontFamily === FontFamily.jakarta ? 'jakarta' : 'inter'
      : resolvedSize && HEADING_SIZES.has(resolvedSize) ? 'jakarta' : 'inter';

  const fontSize = resolvedSize ? FONT_SIZES[resolvedSize] ?? 14 : 14;
  const lineHeight = resolvedSize ? LINE_HEIGHTS[resolvedSize] ?? 20 : 20;

  const textColor = disabled ? '#9AA0A6' : color || '#202124';

  return (
    <RNText
      className={className}
      numberOfLines={numberOfLines}
      onPress={onClick && !disabled ? onClick : undefined}
      style={[
        {
          fontFamily: resolvedFamily === 'jakarta' ? 'PlusJakartaSans' : 'Inter',
          fontWeight: fontWeight as any,
          fontSize,
          color: textColor,
          lineHeight,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
};

export default Text;
