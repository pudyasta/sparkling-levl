import handleFontSize from './utils/handleFontSize';
import handleLineHeight from './utils/handleLineHeight';
import handleLetterSpacing from './utils/handleLetterSpacing';
import handleColor from './utils/handleColor';
import { FontFamily, TextType, type TypographyProps } from './types';

const HEADING_SIZES = new Set([TextType.display, TextType.h1, TextType.h2, TextType.h3]);

const Text = ({
  asSpan = false,
  body,
  fontWeight = 'normal',
  children,
  color,
  disabled = false,
  fontFamily,
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
  // Auto-select Jakarta for headings unless explicitly overridden
  const resolvedFamily =
    fontFamily !== undefined
      ? fontFamily === FontFamily.jakarta
        ? 'jakarta'
        : 'inter'
      : size && HEADING_SIZES.has(size)
        ? 'jakarta'
        : 'inter';

  return (
    <text
      class={className}
      style={{
        fontFamily: resolvedFamily,
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
