import { Colors } from '../../../constant/style';
import type { TypographyProps } from '../types';

const handleColor = ({ color, disabled }: Pick<TypographyProps, 'color' | 'disabled'>) => {
  if (color) return color;
  if (disabled) return Colors.Disabled;
  return Colors.Neutral;
};

export default handleColor;
