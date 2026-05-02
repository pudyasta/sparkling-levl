import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
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
import { useRegister } from '@/usecase/auth/useRegister';

export default function RegisterScreen() {
  const nameRef = useRef<AppInputRef>(null);
  const emailRef = useRef<AppInputRef>(null);
  const usernameRef = useRef<AppInputRef>(null);
  const passwordRef = useRef<AppInputRef>(null);
  const confirmPasswordRef = useRef<AppInputRef>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { execute, isLoading } = useRegister({
    onSuccess: () => router.push('/(auth)/email-confirmation'),
    onValidationError: (errors) => {
      if (errors.name) nameRef.current?.setError(errors.name);
      if (errors.email) emailRef.current?.setError(errors.email);
      if (errors.username) usernameRef.current?.setError(errors.username);
      if (errors.password) passwordRef.current?.setError(errors.password);
      if (errors.password_confirmation)
        confirmPasswordRef.current?.setError(errors.password_confirmation);
    },
    onError: (err) => {
      if (err?.type !== 'VALIDATION_ERROR') setIsModalOpen(true);
    },
  });

  const handleRegister = () => {
    [nameRef, emailRef, usernameRef, passwordRef, confirmPasswordRef].forEach((r) =>
      r.current?.setError(null)
    );
    execute({
      name: nameRef.current?.getValue() ?? '',
      email: emailRef.current?.getValue() ?? '',
      username: usernameRef.current?.getValue() ?? '',
      password: passwordRef.current?.getValue() ?? '',
      password_confirmation: confirmPasswordRef.current?.getValue() ?? '',
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
          <View style={styles.banner}>
            <View style={styles.iconBox}>
              <Text style={{ fontSize: 28 }}>📖</Text>
            </View>
            <AppText size={TextType.h1} fontWeight="bold" color="white" style={{ marginBottom: 4 }}>
              Welcome Explorer!
            </AppText>
            <AppText size={TextType.b2} color="white">
              Discover a new world with Levl!
            </AppText>
          </View>

          <View style={styles.form}>
            <AppInput title="Name" variant="text" ref={nameRef} />
            <View style={{ height: 12 }} />
            <AppInput title="Email" variant="email" ref={emailRef} />
            <View style={{ height: 12 }} />
            <AppInput title="Username" variant="text" ref={usernameRef} />
            <View style={{ height: 12 }} />
            <AppInput title="Password" variant="password" ref={passwordRef} />
            <View style={{ height: 12 }} />
            <AppInput title="Confirm Password" variant="password" ref={confirmPasswordRef} />
            <View style={{ height: 24 }} />

            <AppButton
              label="Sign Up"
              onPress={handleRegister}
              isLoading={isLoading}
              disabled={isLoading}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{ color: Colors.Neutral, fontSize: 14 }}>
                Sudah punya akun?{' '}
                <Text style={{ color: Colors.Primary, fontWeight: '600' }}>Masuk disini</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registration Failed"
        body="Something went wrong. Please try again."
        template={ModalTemplate.Sad}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 240,
    backgroundColor: Colors.Secondary,
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
