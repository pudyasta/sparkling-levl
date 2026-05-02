import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const navigation = useNavigation();
  const emailRef = useRef<AppInputRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

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
      setSuccessModal(true);
    } catch {
      setErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Background }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 32 }}>
          <AppText size={TextType.b1} color={Colors.Primary}>← Back</AppText>
        </TouchableOpacity>

        <AppText size={TextType.h1} fontWeight="bold" style={{ marginBottom: 8 }}>
          Forgot Password
        </AppText>
        <AppText size={TextType.b2} color={Colors.Disabled} style={{ marginBottom: 32 }}>
          Enter your email address and we'll send you a link to reset your password.
        </AppText>

        <AppInput title="Email Address" variant="email" ref={emailRef} />
        <View style={{ height: 24 }} />
        <AppButton label="Send Reset Link" onPress={handleSubmit} isLoading={isLoading} />
      </View>

      <AppModal
        visible={successModal}
        onClose={() => { setSuccessModal(false); navigation.goBack(); }}
        title="Email Sent!"
        body="Check your email for the password reset link."
        template={ModalTemplate.Default}
      />
      <AppModal
        visible={errorModal}
        onClose={() => setErrorModal(false)}
        title="Error"
        body="Failed to send reset email. Please try again."
        template={ModalTemplate.Sad}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 40 },
});
