import type { ColorPalette } from '../../constant/style';
import type { ComponentPropsWithoutRef, ReactNode, MutableRefObject } from '@lynx-js/react';

import type { MouseEvent } from 'react';

export interface TypographyProps extends Omit<ComponentPropsWithoutRef<'span'>, 'css'> {
  /**
   * To determine paragraphy font size
   */
  body?: number | string;
  /**
   * To apply bold on text
   */
  bold?: boolean;
  /**
   * To apply caption Typography design
   */
  caption?: boolean;
  /**
   * To specify typography content
   */
  children?: ReactNode;
  /**
   * To pass custom className to create custom styles
   */
  className?: string;
  /**
   * To apply custom color on text
   */
  color?: string;
  /**
   * To apply disabled on text
   */
  disabled?: boolean;
  /**
   * To change html tag different than it's size appearance
   */
  heading?: number;
  /**
   * To apply large Typography design
   */
  large?: boolean;
  /**
   * To provide link url and apply link design
   */
  link?: string | ((e: MouseEvent<HTMLElement>) => void);
  /**
   * To apply main Typography design
   */
  main?: boolean;
  /**
   * To apply custom margin on Typography
   */
  margin?: string;
  /**
   * To apply micro Typography design
   */
  micro?: boolean;
  /**
   * To set custom ref on Typography
   */
  setRef?: MutableRefObject<HTMLElement>;
  /**
   * To determine heading font size
   */
  tag?: number;
  target?: string;
  /**
   * To transforms text to uppercase
   */
  uppercase?: boolean;
  /**
   * To apply the wrapper as span
   */
  asSpan?: boolean;
  /**
   * To pass callback when Typography is clicked
   */
  onClick?: () => void;

  style?: Record<string, string | number>;

  size?: TextType;

  /**
   * To apply custom font family on text
   */
  fontFamily?: FontFamily;
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
