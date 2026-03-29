import { fontWeightBold } from '../constant';

import type { TypographyProps } from '../types';

const handleFontWeight = (bold: boolean) => {
  if (bold) {
    return fontWeightBold;
  }
};

export default handleFontWeight;
