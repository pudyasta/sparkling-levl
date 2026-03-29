import {
  fontSizeLv1,
  fontSizeLv2,
  fontSizeLv3,
  fontSizeLv4,
  fontSizeLv5,
  fontSizeLv6,
  fontSizeLv7,
} from '../constant';
import { TextType, type TypographyProps } from '../types';

const handleFontSize = ({ size }: Pick<TypographyProps, 'size'>) => {
  switch (size) {
    case TextType.h1:
      return fontSizeLv7;
    case TextType.h2:
      return fontSizeLv6;
    case TextType.h3:
      return fontSizeLv5;
    case TextType.b1:
      return fontSizeLv4;
    case TextType.b2:
      return fontSizeLv3;
    case TextType.b3:
      return fontSizeLv2;
    case TextType.p:
      return fontSizeLv1;
    default:
      return fontSizeLv3;
  }
};

export default handleFontSize;
