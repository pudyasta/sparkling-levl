import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import { Colors } from '@/constant/style';

const eyeOpen = require('@/assets/images/icon/eye.png');
const eyeClose = require('@/assets/images/icon/hidden.png');

export interface InputRef {
  getValue: () => string;
  setValue: (newValue: string) => void;
  setError: (errorMessage: string | null) => void;
  getError: () => string[] | null;
  onChange: (callback: (value: string) => void) => void;
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
  bindChange?: (value: string) => void;
}

const Input = forwardRef<InputRef, InputProps>(
  ({ id, initialValue, title, variant = 'text', bindChange, placeholder, disabled }, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [value, setValue] = useState(initialValue || '');
    const [error, setErrorState] = useState<string[] | null>(null);
    const onChangeCallbackRef = useRef<((v: string) => void) | null>(null);

    useEffect(() => {
      setValue(initialValue || '');
    }, [initialValue]);

    useEffect(() => {
      bindChange?.(value);
    }, [value]);

    useImperativeHandle(ref, () => ({
      getValue: () => value,
      setValue: (v) => setValue(v),
      setError: (msg) => setErrorState(msg ? [msg] : null),
      getError: () => error,
      onChange: (cb) => { onChangeCallbackRef.current = cb; },
    }), [value, error]);

    const handleChange = (text: string) => {
      setValue(text);
      onChangeCallbackRef.current?.(text);
    };

    const borderColor = error ? Colors.Error : focused ? Colors.Primary : Colors.Border;

    const keyboardType =
      variant === 'email' ? 'email-address' :
      variant === 'number' || variant === 'digit' ? 'numeric' :
      variant === 'tel' ? 'phone-pad' : 'default';

    return (
      <View style={styles.container}>
        {title !== '' && <Text style={styles.label}>{title}</Text>}
        <View style={[styles.inputWrapper, { borderColor }]}>
          <TextInput
            editable={!disabled}
            value={value}
            onChangeText={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => { if (!value) setFocused(false); }}
            secureTextEntry={variant === 'password' && !showPassword}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor={Colors.TextDisabled}
            style={[styles.input, { color: disabled ? Colors.TextDisabled : Colors.TextPrimary }]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {variant === 'password' && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <CustomImage
                src={!showPassword ? eyeClose : eyeOpen}
                width={20}
                height={20}
              />
            </TouchableOpacity>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error[0]}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 4 },
  label: { fontSize: 13, color: Colors.TextSecondary, marginBottom: 6, fontWeight: '500' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  input: { flex: 1, fontSize: 14, fontFamily: 'Inter', lineHeight: 20 },
  eyeBtn: { paddingLeft: 8 },
  errorText: { color: Colors.Error, fontSize: 11, marginTop: 4 },
});

export default Input;
