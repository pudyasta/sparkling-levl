/**
 * Logging utility for Lynx environment
 * Lynx's console serializes objects, so this helper provides better visibility
 */

export const debugLog = (label: string, data: any) => {
  console.log(`[${label}] ${JSON.stringify(data, null, 2)}`);
};

export const debugError = (label: string, error: any) => {
  console.error(`[${label}] ${JSON.stringify(error, null, 2)}`);
};

export const debugWarn = (label: string, data: any) => {
  console.warn(`[${label}] ${JSON.stringify(data, null, 2)}`);
};
