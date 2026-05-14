import { Text, type TextStyle, type TextProps as RNTextProps } from 'react-native';

import { Colors } from '@/constant/colors';

export enum TextType {
  h1 = 'h1',
  h2 = 'h2',
  h3 = 'h3',
  b1 = 'b1',
  b2 = 'b2',
  b3 = 'b3',
  p = 'p',
}

const fontSizeMap: Record<TextType, number> = {
  h1: 24,
  h2: 20,
  h3: 17,
  b1: 15,
  b2: 13,
  b3: 11,
  p: 14,
};

const lineHeightMap: Record<TextType, number> = {
  h1: 32,
  h2: 28,
  h3: 24,
  b1: 22,
  b2: 19,
  b3: 17,
  p: 21,
};

interface AppTextProps extends Omit<RNTextProps, 'style'> {
  size?: TextType;
  color?: string;
  fontWeight?: TextStyle['fontWeight'];
  uppercase?: boolean;
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
}

export default function AppText({
  size = TextType.b1,
  color,
  fontWeight = 'normal',
  uppercase = false,
  style,
  children,
  ...rest
}: AppTextProps) {
  const resolvedColor =
    color === 'white'
      ? '#FFFFFF'
      : color === 'black'
      ? '#000000'
      : color === 'red'
      ? Colors.Error
      : color || Colors.Neutral;

  return (
    <Text
      style={[
        {
          fontSize: fontSizeMap[size],
          lineHeight: lineHeightMap[size],
          color: resolvedColor,
          fontWeight,
          textTransform: uppercase ? 'uppercase' : 'none',
        },
        ...(Array.isArray(style) ? style : [style]),
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
