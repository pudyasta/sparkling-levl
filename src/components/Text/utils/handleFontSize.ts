import { DEFAULT_SIZE, TYPOGRAPHY_SCALE } from '../constant';
import type { TypographyProps } from '../types';

const handleFontSize = ({ size }: Pick<TypographyProps, 'size'>): number =>
  TYPOGRAPHY_SCALE[size ?? DEFAULT_SIZE].fontSize;

export default handleFontSize;
