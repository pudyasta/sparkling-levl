type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Determines the time of day based on the current hour (0-23)
 * Morning: 5:00 - 11:59
 * Afternoon: 12:00 - 16:59
 * Evening: 17:00 - 20:59
 * Night: 21:00 - 4:59
 */
export type WaktuHari = 'pagi' | 'siang' | 'sore' | 'malam';

export const getTimeOfDay = (): WaktuHari => {
  const jam = new Date().getHours();

  if (jam >= 5 && jam < 11) {
    return 'pagi';
  } else if (jam >= 11 && jam < 15) {
    return 'siang';
  } else if (jam >= 15 && jam < 18) {
    return 'sore';
  } else {
    return 'malam';
  }
};
