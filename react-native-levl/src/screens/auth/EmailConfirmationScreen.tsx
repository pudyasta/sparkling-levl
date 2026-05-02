import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import AppText, { TextType } from '@/components/AppText';
import { Colors } from '@/constant/colors';
import { useRegisterRepo } from '@/repository/auth/useRegisterRepo';

export default function EmailConfirmationScreen() {
  const [isResending, setIsResending] = useState(false);
  const { resendVerificationEmailApi } = useRegisterRepo();

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmailApi('');
    } catch {
      // ignore
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Background }}>
      <View style={styles.container}>
        <Text style={styles.emoji}>📧</Text>
        <AppText size={TextType.h1} fontWeight="bold" style={{ textAlign: 'center', marginBottom: 12 }}>
          Check Your Email
        </AppText>
        <AppText
          size={TextType.b1}
          color={Colors.Disabled}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          We've sent a verification link to your email. Please check your inbox and verify your
          account before logging in.
        </AppText>

        <AppButton
          label="Back to Login"
          color="primary"
          onPress={() => router.replace('/(auth)/login')}
          style={{ marginBottom: 12 }}
        />
        <AppButton
          label={isResending ? 'Sending...' : 'Resend Email'}
          variant="outlined"
          color="primary"
          onPress={handleResend}
          isLoading={isResending}
          disabled={isResending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 64, marginBottom: 24 },
});
