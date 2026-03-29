import type { FC } from '@lynx-js/react';

interface CustomImage {
  src: string;
  className?: string;
}

const SVG_REGEX = /\.svg(?:\?.*)?$/i;
const SVG_MIME_REGEX = /^image\/svg(?:\+xml)?$/i;
const SVG_DATA_URI_REGEX = /^data:image\/svg\+xml/i;

const CustomImage: FC<CustomImage> = ({ src, className }) => {
  const isSvg =
    src.startsWith('<svg') ||
    src.startsWith('<?xml') ||
    SVG_REGEX.test(src) ||
    SVG_DATA_URI_REGEX.test(src) ||
    SVG_MIME_REGEX.test(src);

  if (isSvg) {
    return (
      // @ts-expect-error
      <native-svg src={src} className={className} />
    );
  }

  return <image src={src} className={className} />;
};

export default CustomImage;
