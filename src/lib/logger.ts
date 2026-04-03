/**
 * Custom logger for Lynx that preserves data types in DevTool console
 * while providing readable output in built bundles
 */
export const logger = {
  log: (...args: any[]) => {
    // In DevTool, objects are displayed with preserved types
    // In built bundle/terminal, they appear as strings but code types remain intact
    console.log(...args);
  },

  info: (...args: any[]) => {
    console.info(...args);
  },

  warn: (...args: any[]) => {
    console.warn(...args);
  },

  error: (...args: any[]) => {
    console.error(...args);
  },

  // For cases where you want formatted output
  debug: (...args: any[]) => {
    // Pass args as-is so DevTool can keep data as object/array, not stringify early
    console.log('[DEBUG]', ...args);
  },
};
