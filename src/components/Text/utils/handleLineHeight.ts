import { DEFAULT_SIZE, TYPOGRAPHY_SCALE } from '../constant';
import type { TypographyProps } from '../types';

const handleLineHeight = ({ size }: Pick<TypographyProps, 'size'>): number =>
  TYPOGRAPHY_SCALE[size ?? DEFAULT_SIZE].lineHeight;

export default handleLineHeight;
