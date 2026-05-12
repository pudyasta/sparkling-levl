import { forwardRef, useImperativeHandle, useState } from '@lynx-js/react';
import { useEffect, useRef } from 'react';

import { eyeClose, eyeOpen } from '../../assets/images/icon';
import { Colors } from '../../constant/style';
import Text from '../Text';
import { TextType } from '../Text/types';
import handleFontSize from '../Text/utils/handleFontSize';
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

interface InputProps {
  initialValue?: string;
  id?: string;
  title: string;
  variant?: string;
  icon?: string;
  disabled?: boolean;
  placeholder?: string;
  bindChange?: (value: any) => void;
}

const Input = forwardRef<InputRef, InputProps>(
  ({ id, initialValue, title, variant, icon, bindChange, placeholder, disabled }, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const timerRef = useRef<number | null>(null);
    const [debouncedValue, setDebouncedValue] = useState<string>(initialValue || '');
    const isFloating = focused || debouncedValue.length > 0;
    const [error, setError] = useState<string[] | null>(null);
    const onChangeCallbackRef = useRef<((value: any) => void) | null>(null);
    const nativeInputRef = useRef<any>(null);

    useEffect(() => {
      setError(null);
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        onChangeCallbackRef.current?.(newValue);
        setDebouncedValue(newValue);
      }, 300) as unknown as number;
    };

    return (
      <view className={style.container}>
        {title !== '' && (
          <Text style={{ backgroundColor: Colors.Background, marginBottom: '8px' }}>{title}</Text>
        )}

        <view
          className={style.input + ' relative overflow-hidden'}
          style={{
            borderColor: error ? Colors.Error : isFloating ? Colors.Primary : Colors.Accent,
          }}
        >
          <input
            disabled={disabled}
            id={id}
            ref={nativeInputRef}
            type={variant === 'password' && !showPassword ? 'password' : 'text'}
            bindfocus={() => setFocused(true)}
            bindblur={() => {
              if (debouncedValue.length === 0) {
                setFocused(false);
              }
            }}
            bindinput={(res: any) => {
              handleInput(res.detail.value);
            }}
            style={{
              color: Colors.Neutral,
              width: '100%',
              height: '100%',
              marginLeft: '4px',
              zIndex: 20,
              position: 'relative',
              fontSize: `${handleFontSize({ size: TextType.h3 })}px`,
              minHeight: '20px',
            }}
            // placeholder={debouncedValue === '' ? placeholder : ''}
            value={debouncedValue}
          />
          {variant === 'password' && (
            <text
              bindtap={() => setShowPassword(!showPassword)}
              style={{ color: 'black', cursor: 'pointer' }}
            >
              {!showPassword ? (
                <CustomImage src={eyeClose} className="h-6 w-[18px]" />
              ) : (
                <CustomImage src={eyeOpen} className="h-6 w-[18px]" />
              )}
            </text>
          )}
        </view>
        <view className={`py-2 ${error ? 'block' : 'hidden'}`}>
          {error && <Text color="red">{error[0]}</Text>}
        </view>
      </view>
    );
  }
);

export default Input;
