export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export const Colors = {
  get Primary() { return '#1A73E8'; },
  get Secondary() { return '#FFC107'; },
  get Accent() { return '#E8F0FE'; },
  get Success() { return '#28A745'; },
  get Error() { return '#DC3545'; },
  get Neutral() { return '#202124'; },
  get Background() { return '#FFFFFF'; },
  get Disabled() { return '#9AA0A6'; },

  PrimaryDark: '#1557B0',
  PrimaryLight: '#E8F0FE',
  SecondaryDark: '#E0A800',
  SecondaryLight: '#FFF8E1',
  Warning: '#FFC107',
  Info: '#1A73E8',

  SuccessBg: '#E6F4EA',
  WarningBg: '#FFF8E1',
  ErrorBg: '#FDE8E9',
  InfoBg: '#E8F0FE',

  N50: '#F9FAFB',
  N100: '#F3F4F6',
  N200: '#E5E7EB',
  N300: '#D1D5DB',
  N400: '#9AA0A6',
  N500: '#6B7280',
  N600: '#4B5563',
  N700: '#374151',
  N900: '#202124',

  Surface: '#FFFFFF',
  Canvas: '#F9FAFB',
  Border: '#E5E7EB',
  Divider: '#F3F4F6',

  TextPrimary: '#202124',
  TextSecondary: '#4B5563',
  TextTertiary: '#6B7280',
  TextDisabled: '#9AA0A6',
  TextInverse: '#FFFFFF',

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
