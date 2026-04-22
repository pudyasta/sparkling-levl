import { fontWeightBold } from '../constant';

import { fontWeight, type TypographyProps } from '../types';

const handleFontWeight = (bold: fontWeight) => {
  if (bold === fontWeight.bold) {
    return 'bold';
  } else if (bold === fontWeight.semiBold) {
    return 500;
  }
  return 300;
};

export default handleFontWeight;
