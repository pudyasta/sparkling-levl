import {
  useState,
  useEffect,
  useLynxGlobalEventListener,
} from '@lynx-js/react';

export const useKeyboardShift = (elementId: string) => {
  const [kbHeight, setKbHeight] = useState(0);

  const setNativeProps = (props: Record<string, unknown>) => {
    lynx
      .createSelectorQuery()
      .select(`#${elementId}`)
      .setNativeProps(props)
      .exec();
  };

  useEffect(() => {
    if (kbHeight === 0) {
      setNativeProps({
        transform: 'translateY(0px)',
        transition: 'transform 0.1s',
      });
    } else {
      setNativeProps({
        transform: 'translateY(-10vh)',
        transition: 'transform 0.3s ease-in-out',
      });
    }
  }, [kbHeight, elementId]);

  useLynxGlobalEventListener(
    'keyboardstatuschanged',
    (status: unknown, height: unknown) => {
      // @ts-ignore
      setKbHeight(status === 'on' ? height : 0);
    },
  );

  return { kbHeight };
};
