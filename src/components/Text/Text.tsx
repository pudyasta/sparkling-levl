import handleFontSize from './utils/handleFontSize';
import handleLineHeight from './utils/handleLineHeight';
import handleLetterSpacing from './utils/handleLetterSpacing';
import handleColor from './utils/handleColor';
import { FontFamily, type TypographyProps } from './types';
import handleFontFamily from './utils/handleFontFamily';

const Text = ({
  asSpan = false,
  body,
  fontWeight = 'normal',
  children,
  color,
  disabled = false,
  fontFamily = FontFamily.inter,
  link = '',
  main = false,
  margin = '',
  tag,
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
        display: link || asSpan ? 'linear' : 'block',
        position: 'relative',
        fontWeight: fontWeight,
        fontSize: `${handleFontSize({ size })}px`,
        color: handleColor({ color, link, tag, main, disabled }),
        lineHeight: `${handleLineHeight({ size })}px`,
        letterSpacing: `${handleLetterSpacing({ body, tag, uppercase })}px`,
        textTransform: uppercase ? 'uppercase' : 'none',
        textDecoration: link ? 'none' : 'initial',
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
