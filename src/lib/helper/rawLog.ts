/**
 * Raw logger using original console (before Lynx override)
 * This gives you true object inspection without Lynx serialization
 */

export const rawLog = {
  log: (...args: any[]) => {
    // Try multiple fallbacks to get the original console
    const originalLog =
      (typeof window !== 'undefined' && (window as any).__originalConsole__?.log) ||
      (typeof globalThis !== 'undefined' && (globalThis as any).__originalConsole__?.log) ||
      (typeof window !== 'undefined' && (window as any).__originalConsoleBound__?.log) ||
      (typeof globalThis !== 'undefined' && (globalThis as any).__originalConsoleBound__?.log) ||
      console.log;

    try {
      originalLog(...args);
    } catch (e) {
      // Fallback to regular console if original fails
      console.log('[RAWLOG FALLBACK]', ...args);
    }
  },

  error: (...args: any[]) => {
    const originalError =
      (typeof window !== 'undefined' && (window as any).__originalConsole__?.error) ||
      (typeof globalThis !== 'undefined' && (globalThis as any).__originalConsole__?.error) ||
      (typeof window !== 'undefined' && (window as any).__originalConsoleBound__?.error) ||
      (typeof globalThis !== 'undefined' && (globalThis as any).__originalConsoleBound__?.error) ||
      console.error;

    try {
      originalError(...args);
    } catch (e) {
      console.error('[RAWLOG FALLBACK]', ...args);
    }
  },

  warn: (...args: any[]) => {
    const originalWarn =
      (typeof window !== 'undefined' && (window as any).__originalConsole__?.warn) ||
      (typeof globalThis !== 'undefined' && (globalThis as any).__originalConsole__?.warn) ||
      (typeof window !== 'undefined' && (window as any).__originalConsoleBound__?.warn) ||
      (typeof globalThis !== 'undefined' && (globalThis as any).__originalConsoleBound__?.warn) ||
      console.warn;

    try {
      originalWarn(...args);
    } catch (e) {
      console.warn('[RAWLOG FALLBACK]', ...args);
    }
  },

  info: (...args: any[]) => {
    const originalInfo =
      (typeof window !== 'undefined' && (window as any).__originalConsole__?.info) ||
      (typeof globalThis !== 'undefined' && (globalThis as any).__originalConsole__?.info) ||
      (typeof window !== 'undefined' && (window as any).__originalConsoleBound__?.info) ||
      (typeof globalThis !== 'undefined' && (globalThis as any).__originalConsoleBound__?.info) ||
      console.info;

    try {
      originalInfo(...args);
    } catch (e) {
      console.info('[RAWLOG FALLBACK]', ...args);
    }
  },
};

export default rawLog;
