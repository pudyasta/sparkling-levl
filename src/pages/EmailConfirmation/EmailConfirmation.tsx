import { type FC, useEffect, useState } from '@lynx-js/react';

import { docsMascot } from '@/assets/images/mascot';
import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import styles from './EmailConfirmation.module.css';
import { useResendVerificationEmail } from './usecase/useResendVerificationEmail';

interface EmailConfirmationProps {
  // Original props
  email: string;
  // New deep link props from globalProps
  userId?: string;
  uuid?: string;
  token?: string;
  // Device info (optional but useful)
  device?: {
    os: string;
    type: string;
  };
}

export const EmailConfirmation: FC<EmailConfirmationProps> = (props) => {
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const { email } = props;
  const { isAuthenticated, user, accessToken, hydrate } = useNativeBridge();
  const { execute: resendVerificationEmail, isLoading } = useResendVerificationEmail();

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (!canResend) return;
    resendVerificationEmail(() => {
      // Reset timer
      setTimer(59);
      setCanResend(false);
    });
  };

  return (
    <view className={styles.container}>
      {/* Character Illustration */}
      <view className={styles.illustrationWrapper}>
        <CustomImage src={docsMascot} className={styles.illustration} />
      </view>

      {/* Text Content */}
      <Text size={TextType.h1} fontFamily={FontFamily.jakarta}>
        Confirm Your Email!
      </Text>
      <Text className={styles.description} typeof={TextType.b2} fontFamily={FontFamily.jakarta}>
        We have sent a confirmation email to
      </Text>
      <Text className={styles.emailText} size={TextType.h2} color={Colors.Primary}>
        {user.email}
      </Text>
      <Text className={styles.instruction}>
        Check your email and click on the confirmation link to continue
      </Text>

      {/* Resend Section */}
      <view className={styles.footer}>
        <Text className={styles.timerText} size={TextType.b3}>
          {canResend ? "Didn't receive the email?" : `Resend the email in ${timer} s`}
        </Text>

        <Button disabled={!canResend} onPress={handleResend}>
          {isLoading ? <Loading size={32} /> : 'Resend'}
        </Button>
        <Button color="primary" variant="outlined" className={styles.backToLoginButton}>
          Skip for now
        </Button>
      </view>
    </view>
  );
};
