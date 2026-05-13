import type { TypographyProps } from '../types';

const handleLetterSpacing = ({ uppercase }: Pick<TypographyProps, 'uppercase'>): number =>
  uppercase ? 0.3 : 0.1;

export default handleLetterSpacing;
