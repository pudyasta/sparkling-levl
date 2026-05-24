import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from '@lynx-js/react';

import { eyeClose, eyeOpen } from '../../assets/images/icon';
import { Colors } from '../../constant/style';
import CustomImage from '../common/CustomImage/CustomImage';
import style from './Input.module.css';

export interface InputRef {
  getValue: () => string;
  setValue: (newValue: string) => void;
  setError: (errorMessage: string | null) => void;
  getError: () => string[] | null;
  onChange: (callback: (value: string) => void) => void;
}

export interface InputValidation {
  pattern: RegExp;
  message: string;
}

type InputVariant = 'number' | 'text' | 'password' | 'digit' | 'tel' | 'email';

interface InputProps {
  initialValue?: string;
  id?: string;
  title: string;
  variant?: InputVariant;
  icon?: string;
  disabled?: boolean;
  placeholder?: string;
  bindChange?: (value: any) => void;
}

const Input = forwardRef<InputRef, InputProps>(
  ({ id, initialValue, title, variant = 'text', icon, bindChange, placeholder, disabled }, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const timerRef = useRef<number | null>(null);
    const [debouncedValue, setDebouncedValue] = useState<string>(initialValue || '');
    const [error, setError] = useState<string[] | null>(null);
    const onChangeCallbackRef = useRef<((value: any) => void) | null>(null);
    const nativeInputRef = useRef<any>(null);

    useEffect(() => {
      setError(null);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    useEffect(() => {
      setDebouncedValue(initialValue || '');
    }, [initialValue]);

    useEffect(() => {
      bindChange?.(debouncedValue);
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
        onChange: (callback) => {
          onChangeCallbackRef.current = callback;
        },
      }),
      [debouncedValue, error]
    );

    const handleInput = (res: any) => {
      const newValue = res;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChangeCallbackRef.current?.(newValue);
        setDebouncedValue(newValue);
      }, 300) as unknown as number;
    };

    const borderColor = error ? Colors.Error : focused ? Colors.Primary : Colors.Border;

    return (
      <view className={style.container}>
        {title !== '' && <text className={style.label}>{title}</text>}

        <view className={style.inputWrapper} style={{ borderColor }}>
          <input
            disabled={disabled}
            id={id}
            ref={nativeInputRef}
            type={
              variant === 'password' && !showPassword
                ? 'password'
                : variant === 'password' && showPassword
                  ? 'text'
                  : variant
            }
            bindfocus={() => setFocused(true)}
            bindblur={() => {
              if (debouncedValue.length === 0) setFocused(false);
            }}
            bindinput={(res: any) => handleInput(res.detail.value)}
            style={{
              color: disabled ? Colors.TextDisabled : Colors.TextPrimary,
              fontSize: '12px',
              fontFamily: 'inter',
              lineHeight: '20px',
              minHeight: '20px',
              width: '100%',
            }}
            value={debouncedValue}
          />

          {variant === 'password' && (
            <text
              bindtap={() => setShowPassword(!showPassword)}
              style={{ marginLeft: '8px', cursor: 'pointer' }}
            >
              {!showPassword ? (
                <CustomImage src={eyeClose} className="h-5 w-5" />
              ) : (
                <CustomImage src={eyeOpen} className="h-5 w-5" />
              )}
            </text>
          )}
        </view>

        {error && <text className={style.errorText}>{error[0]}</text>}
      </view>
    );
  }
);

export default Input;
