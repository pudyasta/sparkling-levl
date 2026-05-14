export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export type ColorPalette = {
  Primary: string;
  Secondary: string;
  Accent: string;
  Success: string;
  Error: string;
  Neutral: string;
  Background: string;
  Disabled: string;
};

const LightColors: ColorPalette = {
  Primary: '#1A73E8',
  Secondary: '#FFC107',
  Accent: '#E8F0FE',
  Success: '#28A745',
  Error: '#DC3545',
  Neutral: '#202124',
  Background: '#FFFFFF',
  Disabled: '#9AA0A6',
};

const DarkColors: ColorPalette = {
  Primary: '#8AB4F8',
  Secondary: '#FDD663',
  Accent: '#2D2E31',
  Success: '#81C995',
  Error: '#F28B82',
  Neutral: '#E8EAED',
  Background: '#121212',
  Disabled: '#5F6368',
};

export const Colors = {
  // Theme-aware brand colors
  get Primary() {
    return lynx.__globalProps.appTheme === Theme.Dark
      ? DarkColors.Primary
      : LightColors.Primary;
  },
  get Secondary() {
    return lynx.__globalProps.appTheme === Theme.Dark
      ? DarkColors.Secondary
      : LightColors.Secondary;
  },
  get Accent() {
    return lynx.__globalProps.appTheme === Theme.Dark
      ? DarkColors.Accent
      : LightColors.Accent;
  },
  get Success() {
    return lynx.__globalProps.appTheme === Theme.Dark
      ? DarkColors.Success
      : LightColors.Success;
  },
  get Error() {
    return lynx.__globalProps.appTheme === Theme.Dark
      ? DarkColors.Error
      : LightColors.Error;
  },
  get Neutral() {
    return lynx.__globalProps.appTheme === Theme.Dark
      ? DarkColors.Neutral
      : LightColors.Neutral;
  },
  get Background() {
    return lynx.__globalProps.appTheme === Theme.Dark
      ? DarkColors.Background
      : LightColors.Background;
  },
  get Disabled() {
    return lynx.__globalProps.appTheme === Theme.Dark
      ? DarkColors.Disabled
      : LightColors.Disabled;
  },

  // Extended brand tokens
  PrimaryDark: '#1557B0',
  PrimaryLight: '#E8F0FE',
  SecondaryDark: '#E0A800',
  SecondaryLight: '#FFF8E1',
  Warning: '#FFC107',
  Info: '#1A73E8',

  // Semantic background tints
  SuccessBg: '#E6F4EA',
  WarningBg: '#FFF8E1',
  ErrorBg: '#FDE8E9',
  InfoBg: '#E8F0FE',

  // Neutral scale (N50–N900)
  N50: '#F9FAFB',
  N100: '#F3F4F6',
  N200: '#E5E7EB',
  N300: '#D1D5DB',
  N400: '#9AA0A6',
  N500: '#6B7280',
  N600: '#4B5563',
  N700: '#374151',
  N900: '#202124',

  // Surface / layout
  Surface: '#FFFFFF',
  Canvas: '#F9FAFB',
  Border: '#E5E7EB',
  Divider: '#F3F4F6',

  // Semantic text colors
  TextPrimary: '#202124',
  TextSecondary: '#4B5563',
  TextTertiary: '#6B7280',
  TextDisabled: '#9AA0A6',
  TextInverse: '#FFFFFF',

  // Badge backgrounds and text (per design system)
  SuccessBadgeBg: '#E8F8E9',
  SuccessBadgeText: '#024F08',
  WarningBadgeBg: '#FFF4E0',
  WarningBadgeText: '#854F0B',
  DangerBadgeBg: '#FDE8E8',
  DangerBadgeText: '#791F1F',
  InfoBadgeBg: '#E6F1FB',
  InfoBadgeText: '#0C447C',
  NeutralBadgeBg: '#F3F4F6',
  NeutralBadgeText: '#374151',
};
