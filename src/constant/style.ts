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
  Canvas: string;
  Surface: string;
  SurfaceAlt: string;
  Border: string;
  BorderLight: string;
  TextMuted: string;
  TextSubtle: string;
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
  Canvas: '#F8F9FA',
  Surface: '#FFFFFF',
  SurfaceAlt: '#F1F5F9',
  Border: '#E2E8F0',
  BorderLight: '#F1F5F9',
  TextMuted: '#64748B',
  TextSubtle: '#94A3B8',
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
  Canvas: '#0D0D0D',
  Surface: '#1E1E1E',
  SurfaceAlt: '#2A2A2A',
  Border: '#383838',
  BorderLight: '#2D2D2D',
  TextMuted: '#9AA0A6',
  TextSubtle: '#6B7280',
};

const isDark = () => lynx.__globalProps.appTheme === Theme.Dark;

export const Colors: ColorPalette = {
  get Primary() { return isDark() ? DarkColors.Primary : LightColors.Primary; },
  get Secondary() { return isDark() ? DarkColors.Secondary : LightColors.Secondary; },
  get Accent() { return isDark() ? DarkColors.Accent : LightColors.Accent; },
  get Success() { return isDark() ? DarkColors.Success : LightColors.Success; },
  get Error() { return isDark() ? DarkColors.Error : LightColors.Error; },
  get Neutral() { return isDark() ? DarkColors.Neutral : LightColors.Neutral; },
  get Background() { return isDark() ? DarkColors.Background : LightColors.Background; },
  get Disabled() { return isDark() ? DarkColors.Disabled : LightColors.Disabled; },
  get Canvas() { return isDark() ? DarkColors.Canvas : LightColors.Canvas; },
  get Surface() { return isDark() ? DarkColors.Surface : LightColors.Surface; },
  get SurfaceAlt() { return isDark() ? DarkColors.SurfaceAlt : LightColors.SurfaceAlt; },
  get Border() { return isDark() ? DarkColors.Border : LightColors.Border; },
  get BorderLight() { return isDark() ? DarkColors.BorderLight : LightColors.BorderLight; },
  get TextMuted() { return isDark() ? DarkColors.TextMuted : LightColors.TextMuted; },
  get TextSubtle() { return isDark() ? DarkColors.TextSubtle : LightColors.TextSubtle; },
};
