import type { ColorPalette } from '../../constant/style';
import type { ComponentPropsWithoutRef, ReactNode, MutableRefObject } from '@lynx-js/react';

import type { MouseEvent } from 'react';

export interface TypographyProps extends Omit<ComponentPropsWithoutRef<'span'>, 'css'> {
  body?: number | string;
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
    | '900'
    | undefined;
  caption?: boolean;
  children?: ReactNode;
  className?: string;
  color?: string;
  disabled?: boolean;
  heading?: number;
  large?: boolean;
  link?: string | ((e: MouseEvent<HTMLElement>) => void);
  main?: boolean;
  margin?: string;
  micro?: boolean;
  setRef?: MutableRefObject<HTMLElement>;
  tag?: number;
  target?: string;
  uppercase?: boolean;
  asSpan?: boolean;
  onClick?: () => void;
  style?: Record<string, string | number>;
  size?: TextType;
  fontFamily?: FontFamily;
}

export enum TextType {
  display = 'display',
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

export enum fontWeight {
  bold = 800,
  semiBold = 500,
}
