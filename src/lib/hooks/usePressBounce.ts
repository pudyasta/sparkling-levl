import { useCallback, useRef, useState } from '@lynx-js/react';

/**
 * Drives the shared `animate-press-bounce` class (defined in styles/core.css)
 * via a brief state toggle. Call `trigger` from a `bindtap` handler and spread
 * `className` onto the tappable view.
 */
export function usePressBounce(duration = 300) {
  const [pressed, setPressed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setPressed(true);
    timer.current = setTimeout(() => setPressed(false), duration);
  }, [duration]);

  return { pressed, trigger, className: pressed ? 'animate-press-bounce' : '' };
}
