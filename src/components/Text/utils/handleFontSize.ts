import { TextType, type TypographyProps } from '../types';

const handleFontSize = ({ size }: Pick<TypographyProps, 'size'>) => {
  switch (size) {
    case TextType.display: return 28;
    case TextType.h1:      return 22;
    case TextType.h2:      return 18;
    case TextType.h3:      return 16;
    case TextType.b1:      return 16;
    case TextType.b2:      return 14;
    case TextType.b3:      return 13;
    case TextType.p:       return 12;
    default:               return 14;
  }
};

export default handleFontSize;
