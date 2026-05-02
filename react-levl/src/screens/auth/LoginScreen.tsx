import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import AppInput, { type AppInputRef } from '@/components/AppInput';
import AppModal, { ModalTemplate } from '@/components/AppModal';
import AppText, { TextType } from '@/components/AppText';
import { Colors } from '@/constant/colors';
import { useLogin } from '@/usecase/auth/useLogin';
import type { RootStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const emailRef = useRef<AppInputRef>(null);
  const passwordRef = useRef<AppInputRef>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { execute, isLoading } = useLogin({
    onValidationError: (errors) => {
      if (errors.login) emailRef.current?.setError(errors.login);
      if (errors.password) passwordRef.current?.setError(errors.password);
    },
    onSuccess: () => {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    },
    onError: (error) => {
      if (error?.type !== 'VALIDATION_ERROR') setIsModalOpen(true);
    },
  });

  const handleLogin = () => {
    emailRef.current?.setError(null);
    passwordRef.current?.setError(null);
    execute({
      login: emailRef.current?.getValue() ?? '',
      password: passwordRef.current?.getValue() ?? '',
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.iconBox}>
              <Text style={{ fontSize: 28 }}>📖</Text>
            </View>
            <AppText size={TextType.h1} fontWeight="bold" color="white" style={{ marginBottom: 4 }}>
              Halo
            </AppText>
            <AppText size={TextType.b2} color="white">
              Masuk dulu yuk buat mulai belajar lagi!
            </AppText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <AppInput title="Email or Username" variant="email" ref={emailRef} />
            <View style={{ height: 16 }} />
            <AppInput title="Password" variant="password" ref={passwordRef} />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 20 }}
            >
              <Text style={{ color: Colors.Primary, fontSize: 14 }}>Lupa Password?</Text>
            </TouchableOpacity>

            <AppButton label="Sign In" onPress={handleLogin} isLoading={isLoading} disabled={isLoading} />

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{ color: Colors.Neutral, fontSize: 14 }}>
                Belum punya akun?{' '}
                <Text style={{ color: Colors.Primary, fontWeight: '600' }}>Daftar disini</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Oops! Something went wrong"
        body="Email or password is incorrect. Please try again."
        template={ModalTemplate.Sad}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 260,
    backgroundColor: Colors.Primary,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'flex-end',
    gap: 6,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  form: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
  },
});
