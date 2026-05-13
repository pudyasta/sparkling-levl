import { fontFamilyInter, fontFamilyJakarta } from '../constant';
import { FontFamily } from '../types';

const handleFontFamily = (fontFamily: FontFamily): string =>
  fontFamily === FontFamily.jakarta ? fontFamilyJakarta : fontFamilyInter;

export default handleFontFamily;
