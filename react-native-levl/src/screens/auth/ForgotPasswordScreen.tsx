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
import { guestAPIClient } from '@/lib/api/core';
import { POST_METHOD } from '@/constant/api';
import { AUTH_FORGOT_PASSWORD_ENDPOINT } from '@/constant/route';

export default function ForgotPasswordScreen() {
  const emailRef = useRef<AppInputRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [isErrorModal, setIsErrorModal] = useState(false);

  const handleSubmit = async () => {
    const email = emailRef.current?.getValue() ?? '';
    if (!email) {
      emailRef.current?.setError('Email is required');
      return;
    }
    setIsLoading(true);
    try {
      await guestAPIClient(AUTH_FORGOT_PASSWORD_ENDPOINT, {
        method: POST_METHOD,
        data: { email },
      });
      setIsSuccessModal(true);
    } catch {
      setIsErrorModal(true);
    } finally {
      setIsLoading(false);
    }
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
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
            </TouchableOpacity>
            <AppText size={TextType.h1} fontWeight="bold" color="white">
              Forgot Password
            </AppText>
            <AppText size={TextType.b2} color="white" style={{ marginTop: 4 }}>
              Enter your email and we'll send a reset link.
            </AppText>
          </View>

          <View style={styles.form}>
            <AppInput title="Email" variant="email" ref={emailRef} />
            <View style={{ height: 24 }} />
            <AppButton
              label="Send Reset Link"
              onPress={handleSubmit}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppModal
        visible={isSuccessModal}
        onClose={() => { setIsSuccessModal(false); router.back(); }}
        title="Email Sent!"
        body="Check your inbox for the password reset link."
        template={ModalTemplate.Default}
        buttonText="Back to Login"
        onButtonPress={() => router.back()}
      />
      <AppModal
        visible={isErrorModal}
        onClose={() => setIsErrorModal(false)}
        title="Something went wrong"
        body="Could not send reset email. Please try again."
        template={ModalTemplate.Sad}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.Primary,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  form: { flex: 1, padding: 24, paddingTop: 32 },
});
