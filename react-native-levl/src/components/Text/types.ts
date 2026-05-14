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
  jakarta = 'jakarta',
  inter = 'inter',
}

export interface TypographyProps {
  asSpan?: boolean;
  body?: boolean;
  fontWeight?: string;
  children?: React.ReactNode;
  color?: string;
  disabled?: boolean;
  fontFamily?: FontFamily;
  link?: string;
  main?: boolean;
  margin?: string;
  tag?: string;
  uppercase?: boolean;
  onClick?: () => void;
  size?: TextType;
  className?: string;
  style?: object;
  typeof?: TextType;
  numberOfLines?: number;
}
