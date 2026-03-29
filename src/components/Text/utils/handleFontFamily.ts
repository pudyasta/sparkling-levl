import { FontFamily } from '../types';

const handleFontFamily = (fontFamily: FontFamily) => {
  if (fontFamily === FontFamily.jakarta) return 'jakarta';
  return 'inter';
};

export default handleFontFamily;
