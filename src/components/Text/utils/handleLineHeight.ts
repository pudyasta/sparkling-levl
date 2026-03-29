import {
  fontSizeLv1,
  fontSizeLv2,
  fontSizeLv3,
  fontSizeLv4,
  fontSizeLv5,
  fontSizeLv6,
  fontSizeLv7,
  lineHeightLv2,
  lineHeightLv3,
  lineHeightLv4,
  lineHeightLv5,
  lineHeightLv6,
  lineHeightLv7,
  lineHeightLv9,
} from '../constant';
import { TextType, type TypographyProps } from '../types';

const handleLineHeight = ({ size }: Pick<TypographyProps, 'size'>) => {
  switch (size) {
    case TextType.h1:
      return lineHeightLv9;
    case TextType.h2:
      return lineHeightLv7;
    case TextType.h3:
      return lineHeightLv6;
    case TextType.b1:
      return lineHeightLv5;
    case TextType.b2:
      return lineHeightLv4;
    case TextType.b3:
      return lineHeightLv3;
    case TextType.p:
      return lineHeightLv2;
    default:
      return lineHeightLv3;
  }
};

export default handleLineHeight;
