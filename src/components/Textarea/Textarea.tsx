import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from '@lynx-js/react';

import { Colors } from '../../constant/style';
import style from './Input.module.css';

export interface TextAreaRef {
  getValue: () => string;
  setValue: (newValue: string) => void;
  setError: (errorMessage: string | null) => void;
  getError: () => string[] | null;
}

interface TextareaProps {
  title: string;
  placeholder?: string;
  bindChange?: () => void;
  initialValue?: string;
  disabled?: boolean;
}

const Textarea = forwardRef<TextAreaRef, TextareaProps>(
  ({ title, placeholder, bindChange, initialValue, disabled }, ref) => {
    const [focused, setFocused] = useState(false);
    const timerRef = useRef<number | null>(null);
    const [debouncedValue, setDebouncedValue] = useState<string>(initialValue || '');
    const [error, setError] = useState<string[] | null>(null);

    useEffect(() => {
      setError(null);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    useEffect(() => {
      bindChange?.();
    }, [debouncedValue]);

    useImperativeHandle(
      ref,
      () => ({
        getValue: () => debouncedValue,
        setValue: (newValue) => {
          setDebouncedValue(newValue);
          if (timerRef.current) clearTimeout(timerRef.current);
        },
        setError: (message: string | null) => setError(message ? [message] : null),
        getError: () => error,
      }),
      [debouncedValue, error]
    );

    const handleInput = (res: any) => {
      const newValue = res;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDebouncedValue(newValue);
      }, 300) as unknown as number;
    };

    const borderColor = error ? Colors.Error : focused ? Colors.Primary : Colors.Border;

    return (
      <view className={style.container}>
        {title !== '' && (
          <text className={style.label}>{title}</text>
        )}

        <view className={style.input} style={{ borderColor }}>
          <input
            disabled={disabled}
            type="text"
            bindfocus={() => setFocused(true)}
            bindblur={() => {
              if (debouncedValue.length === 0) setFocused(false);
            }}
            bindinput={(res: any) => handleInput(res.detail.value)}
            style={{
              color: disabled ? Colors.TextDisabled : Colors.TextPrimary,
              width: '100%',
              fontSize: '14px',
              fontFamily: 'inter',
              lineHeight: '20px',
              minHeight: '60px',
            }}
            value={debouncedValue}
          />
        </view>

        {error && (
          <text className={style.errorText}>{error[0]}</text>
        )}
      </view>
    );
  }
);

export default Textarea;
