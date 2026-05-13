import { TextType } from './types';

/**
 * Single source of truth for the typography scale.
 * Values mirror the CSS variables in src/styles/core.css:
 * --text-caption/xs/sm/md/lg/xl/3xl and their --leading-* counterparts.
 */
export const TYPOGRAPHY_SCALE: Record<TextType, { fontSize: number; lineHeight: number }> = {
  [TextType.p]:  { fontSize: 10, lineHeight: 16 }, // --text-caption / --leading-caption
  [TextType.b3]: { fontSize: 12, lineHeight: 18 }, // --text-xs     / --leading-xs
  [TextType.b2]: { fontSize: 14, lineHeight: 20 }, // --text-sm     / --leading-sm
  [TextType.b1]: { fontSize: 16, lineHeight: 22 }, // --text-md     / --leading-md
  [TextType.h3]: { fontSize: 18, lineHeight: 24 }, // --text-lg     / --leading-lg
  [TextType.h2]: { fontSize: 20, lineHeight: 28 }, // --text-xl     / --leading-xl
  [TextType.h1]: { fontSize: 28, lineHeight: 36 }, // --text-3xl    / --leading-3xl
} as const;

export const DEFAULT_SIZE = TextType.b2;

export const fontFamilyInter = 'inter';
export const fontFamilyJakarta = 'jakarta';
