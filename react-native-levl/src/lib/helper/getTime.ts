export type WaktuHari = 'pagi' | 'siang' | 'sore' | 'malam';

export const getTimeOfDay = (): WaktuHari => {
  const jam = new Date().getHours();
  if (jam >= 5 && jam < 11) return 'pagi';
  if (jam >= 11 && jam < 15) return 'siang';
  if (jam >= 15 && jam < 18) return 'sore';
  return 'malam';
};
