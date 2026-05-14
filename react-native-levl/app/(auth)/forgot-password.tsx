import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Input, { type InputRef } from '@/components/Input/Input';
import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
import { guestAPIClient } from '@/lib/api/core';

export default function ForgotPasswordScreen() {
  const emailRef = useRef<InputRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const email = emailRef.current?.getValue() || '';
    if (!email) { emailRef.current?.setError('Please enter your email'); return; }
    setIsLoading(true);
    try {
      await guestAPIClient('/auth/forgot-password', { method: 'POST', data: { email } });
      setSent(true);
    } catch {
      emailRef.current?.setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text size={TextType.h1} fontWeight="bold" style={{ marginBottom: 8 }}>Lupa Password</Text>
        <Text size={TextType.b2} color={Colors.TextSecondary} style={{ marginBottom: 32 }}>
          Masukkan email kamu untuk mendapatkan link reset password.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text size={TextType.b1} color={Colors.Success}>
              Email reset password telah dikirim! Cek inbox kamu.
            </Text>
          </View>
        ) : (
          <>
            <Input title="Email" variant="email" ref={emailRef} />
            <Button onPress={handleSubmit} disabled={isLoading} style={{ marginTop: 16 }}>
              {isLoading ? <Loading size={24} color="#fff" /> : 'Kirim Link Reset'}
            </Button>
          </>
        )}

        <Button
          variant="outlined"
          color="primary"
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          Kembali ke Login
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  successBox: { backgroundColor: Colors.SuccessBg, padding: 16, borderRadius: 12, marginBottom: 16 },
});
