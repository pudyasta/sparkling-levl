type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Determines the time of day based on the current hour (0-23)
 * Morning: 5:00 - 11:59
 * Afternoon: 12:00 - 16:59
 * Evening: 17:00 - 20:59
 * Night: 21:00 - 4:59
 */
export const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'evening';
  } else {
    return 'night';
  }
};
