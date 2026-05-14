import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface CustomImageProps {
  src: any;
  className?: string;
  style?: object;
  width?: number | string;
  height?: number | string;
}

const SVG_REGEX = /\.svg(?:\?.*)?$/i;
const SVG_DATA_URI_REGEX = /^data:image\/svg\+xml/i;

const CustomImage: React.FC<CustomImageProps> = ({ src, style, width, height }) => {
  const w = (width as number) || undefined;
  const h = (height as number) || undefined;
  const sizeStyle = { width: w || '100%', height: h || '100%' };
  const resolvedStyle = [sizeStyle, style];

  // Local SVG imported via react-native-svg-transformer (returns a React component)
  if (src && typeof src === 'function') {
    const SvgComp = src as React.FC<{ width?: number; height?: number }>;
    return <SvgComp width={w} height={h} />;
  }

  if (typeof src === 'string') {
    const isSvgUrl =
      SVG_REGEX.test(src) ||
      SVG_DATA_URI_REGEX.test(src) ||
      src.startsWith('<svg') ||
      src.startsWith('<?xml');

    if (isSvgUrl && src.startsWith('http')) {
      return <SvgUri width={w || '100%'} height={h || '100%'} uri={src} />;
    }

    return (
      <Image
        source={{ uri: src }}
        style={resolvedStyle as any}
        resizeMode="contain"
      />
    );
  }

  // Static asset (require())
  if (typeof src === 'number') {
    return <Image source={src} style={resolvedStyle as any} resizeMode="contain" />;
  }

  return null;
};

export default CustomImage;
