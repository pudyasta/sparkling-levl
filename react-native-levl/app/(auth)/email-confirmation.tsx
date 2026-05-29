import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { docsMascot } from '../../src/assets/images/mascot';
import { Loading } from '../../src/components/Loading/Loading';
import Text from '../../src/components/Text';
import { FontFamily, TextType } from '../../src/components/Text/types';
import Button from '../../src/components/common/Button';
import CustomImage from '../../src/components/common/CustomImage/CustomImage';
import { Colors } from '../../src/constant/style';
import { useNativeBridge } from '../../src/context/NativeBridgeProvider';
import { useResendVerificationEmail } from '../../src/pages/EmailConfirmation/usecase/useResendVerificationEmail';

export default function EmailConfirmationScreen() {
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const { user } = useNativeBridge();
  const { execute: resendVerificationEmail, isLoading } = useResendVerificationEmail();

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleResend = () => {
    if (!canResend) return;
    resendVerificationEmail(() => {
      setTimer(59);
      setCanResend(false);
    });
  };

  return (
    <View style={styles.container}>
      <CustomImage src={docsMascot} width={180} height={180} />

      <Text
        size={TextType.h1}
        fontFamily={FontFamily.jakarta}
        style={{ marginTop: 24, textAlign: 'center' }}
      >
        Confirm Your Email!
      </Text>
      <Text size={TextType.b2} style={styles.description}>
        We have sent a confirmation email to
      </Text>
      <Text size={TextType.h2} color={Colors.Primary} style={{ textAlign: 'center' }}>
        {user?.email || ''}
      </Text>
      <Text style={styles.instruction}>
        Check your email and click on the confirmation link to continue
      </Text>

      <View style={styles.footer}>
        <Text size={TextType.b3} style={styles.timer}>
          {canResend ? "Didn't receive the email?" : `Resend the email in ${timer} s`}
        </Text>
        <Button disabled={!canResend} onPress={handleResend} style={{ marginTop: 8 }}>
          {isLoading ? <Loading size={24} color="#fff" /> : 'Resend'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  description: { color: Colors.TextSecondary, textAlign: 'center', marginTop: 8 },
  instruction: {
    color: Colors.TextTertiary,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
    paddingHorizontal: 16,
  },
  footer: { width: '100%', marginTop: 32 },
  timer: { textAlign: 'center', color: Colors.TextTertiary },
});
