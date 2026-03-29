import {
  trackingTight,
  trackingTighter,
  trackingWide,
  trackingWider,
  trackingWidest,
} from '../constant';

import type { TypographyProps } from '../types';

const handleLetterSpacing = ({
  body,
  tag,
  uppercase,
}: Pick<TypographyProps, 'body' | 'tag' | 'uppercase'>) => {
  switch (true) {
    case tag === 1:
      return `${trackingTighter}px`;
    case tag === 2 || tag === 3 || tag === 4 || tag === 5 || tag === 6:
      return `${trackingTight}px`;
    case body === 'display-2' || body === 'paragraph-2':
      return `${trackingWider}px`;
    case body === 'display-3' && uppercase:
      return `${trackingWidest}px`;
    default:
      return `${trackingWide}px`;
  }
};

export default handleLetterSpacing;
