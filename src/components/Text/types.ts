import type { ComponentPropsWithoutRef, ReactNode } from '@lynx-js/react';

export interface TypographyProps extends Omit<ComponentPropsWithoutRef<'span'>, 'css'> {
  children?: ReactNode;
  className?: string;
  color?: string;
  disabled?: boolean;
  fontFamily?: FontFamily;
  fontWeight?:
    | 'bold'
    | 'normal'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  margin?: string;
  onClick?: () => void;
  size?: TextType;
  style?: Record<string, string | number>;
  uppercase?: boolean;
  asSpan?: boolean;
}

export enum TextType {
  h1 = 'h1',
  h2 = 'h2',
  h3 = 'h3',
  b1 = 'b1',
  b2 = 'b2',
  b3 = 'b3',
  p = 'p',
}

export enum FontFamily {
  inter = 'font-inter',
  jakarta = 'font-jakarta',
}
