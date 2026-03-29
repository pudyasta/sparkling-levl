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

export const Colors: ColorPalette = {
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
};
