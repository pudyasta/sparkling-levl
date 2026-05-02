import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constant/colors';

export interface AppInputRef {
  getValue: () => string;
  setValue: (v: string) => void;
  setError: (msg: string | null) => void;
  getError: () => string | null;
}

interface AppInputProps {
  title: string;
  variant?: 'text' | 'email' | 'password';
  onChangeValue?: (v: string) => void;
}

const AppInput = forwardRef<AppInputRef, AppInputProps>(
  ({ title, variant = 'text', onChangeValue }, ref) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => value,
      setValue: (v) => setValue(v),
      setError: (msg) => setError(msg),
      getError: () => error,
    }));

    const handleChange = (text: string) => {
      setValue(text);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        onChangeValue?.(text);
      }, 300);
    };

    const borderColor = error
      ? Colors.Error
      : focused
      ? Colors.Primary
      : Colors.Accent;

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{title}</Text>
        <View style={[styles.inputRow, { borderColor }]}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            secureTextEntry={variant === 'password' && !showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={variant === 'email' ? 'email-address' : 'default'}
            placeholderTextColor={Colors.Disabled}
          />
          {variant === 'password' && (
            <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
              <Text style={{ fontSize: 16 }}>{showPassword ? '👁' : '🙈'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }
);

export default AppInput;

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 4 },
  label: { fontSize: 13, color: Colors.Neutral, marginBottom: 6, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    minHeight: 48,
  },
  input: { flex: 1, fontSize: 15, color: Colors.Neutral, paddingVertical: 10 },
  eyeBtn: { padding: 4 },
  error: { fontSize: 12, color: Colors.Error, marginTop: 4 },
});
