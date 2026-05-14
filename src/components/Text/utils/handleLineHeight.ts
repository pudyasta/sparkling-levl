import { TextType, type TypographyProps } from '../types';

const handleLineHeight = ({ size }: Pick<TypographyProps, 'size'>) => {
  switch (size) {
    case TextType.display: return 36;
    case TextType.h1:      return 30;
    case TextType.h2:      return 26;
    case TextType.h3:      return 24;
    case TextType.b1:      return 24;
    case TextType.b2:      return 20;
    case TextType.b3:      return 18;
    case TextType.p:       return 16;
    default:               return 20;
  }
};

export default handleLineHeight;
