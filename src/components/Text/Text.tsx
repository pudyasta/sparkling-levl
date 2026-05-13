import handleColor from './utils/handleColor';
import handleFontFamily from './utils/handleFontFamily';
import handleFontSize from './utils/handleFontSize';
import handleLetterSpacing from './utils/handleLetterSpacing';
import handleLineHeight from './utils/handleLineHeight';
import { FontFamily, type TypographyProps } from './types';

const Text = ({
  asSpan = false,
  fontWeight = 'normal',
  children,
  color,
  disabled = false,
  fontFamily = FontFamily.inter,
  margin = '',
  uppercase = false,
  onClick = () => {},
  size,
  className = '',
  style = {},
}: TypographyProps) => {
  return (
    <text
      class={className}
      style={{
        fontFamily: handleFontFamily(fontFamily),
        display: asSpan ? 'linear' : 'block',
        position: 'relative',
        fontWeight,
        fontSize: `${handleFontSize({ size })}px`,
        lineHeight: `${handleLineHeight({ size })}px`,
        letterSpacing: `${handleLetterSpacing({ uppercase })}px`,
        color: handleColor({ color, disabled }),
        textTransform: uppercase ? 'uppercase' : 'none',
        ...(margin ? { margin } : {}),
        ...style,
      }}
      bindtap={!disabled ? onClick : undefined}
    >
      {children}
    </text>
  );
};

export default Text;
