import { useRef, useEffect, useState } from '@lynx-js/react';
import Input, { type InputRef } from '@/components/Input/Input';

import Button from '@/components/common/Button';
import Text from '@/components/Text';

import { FontFamily, TextType } from '@/components/Text/types';

import { useAuth } from '@/context/AuthProvider';
import { useLogin } from '@/pages/Login/usecase/useLogin';
import { useKeyboardShift } from '@/hooks/useKeyboardShift';

import { loginBanner } from '@/assets/images/pages';
import { hiMascot } from '@/assets/images/mascot';

import style from './LoginPage.module.css';
import { Colors } from '@/constant/style';

import { FORGOT_PASSWORD_ROUTE, HOME_ROUTE, SIGNUP_ROUTE } from '@/constant/route';
import { Loading } from '@/components/Loading/Loading';
import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import { navigate } from '@/lib/native/nativeNavigate';
import { MAIN_ACTIVITY, REGISTER_ACTIVITY } from '@/constant/activity';
import * as storage from 'sparkling-storage';
import * as router from 'sparkling-navigation';
import { open } from 'sparkling-navigation';
import { debugLog } from '@/lib/helper/logger';

export default function LoginPage() {
  const emailRef = useRef<InputRef>(null);
  const passwordRef = useRef<InputRef>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { kbHeight } = useKeyboardShift('panel');

  const { execute, isLoading } = useLogin({
    onValidationError: (errors) => {
      if (errors.login) emailRef.current?.setError(errors.login);
      if (errors.password) passwordRef.current?.setError(errors.password);
    },
    onSuccess: () => {
      router.open(
        { scheme: 'hybrid://lynxview_page?bundle=second.lynx.bundle&title=Sparkling' },
        (result: router.OpenResponse) => {
          console.log('opening');
        }
      );
    },
    onError: (error) => {
      if (error.type !== 'VALIDATION_ERROR') {
        setIsModalOpen(true);
      }
    },
  });

  const loginUser = () => {
    emailRef.current?.setError(null);
    passwordRef.current?.setError(null);
    execute({
      login: emailRef.current?.getValue() || '',
      password: passwordRef.current?.getValue() || '',
    });
  };

  useEffect(() => {
    debugLog('LoginPage mounted', { tes: 'ok' });
    storage.setItem({ key: 'token', data: 'abc123', biz: 'demo', validDuration: 3600 }, (res) => {
      console.log('res', res);
    });
  });

  return (
    <scroll-view
      scroll-orientation="vertical"
      id="panel"
      className={style.container}
      style={{ paddingBottom: kbHeight > 0 ? '10vh' : '0px' }}
    >
      <view
        className={style.banner}
        style={{
          backgroundImage: `url(${loginBanner})`,
        }}
      >
        <view className={style.header}>
          <view className={style.headerLogo}>
            <Text size={TextType.h1}>📖</Text>
          </view>

          <Text color="white" bold size={TextType.h1} fontFamily={FontFamily.jakarta}>
            Welcome Back!
          </Text>
          <Text color="white" size={TextType.b2}>
            Sign in to continue your learning journey
          </Text>
        </view>
        <view className={style.mascotContainer}>
          <image src={hiMascot} className={style.mascot} />
        </view>
      </view>
      <view className={style.formContainer}>
        <Input title="Email or username" variant="email" icon="mail" ref={emailRef} />
        <Input title="Password" variant="password" icon="lock" ref={passwordRef} />
        <Text
          typeof={TextType.b1}
          className={style.forgotPassword}
          style={{
            color: Colors.Primary,
          }}
        >
          Forgot Password?
        </Text>
        <Button color="blue" variant="solid" onPress={loginUser} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loading size={32} />
            </>
          ) : (
            'Sign In'
          )}
        </Button>
        <text bindtap={loginUser}>Sign In</text>

        {/* Signup */}
        <Text typeof={TextType.b1}>
          Udah punya akun?{' '}
          <Text typeof={TextType.b1} style={{ color: Colors.Primary }}>
            Daftar disini
          </Text>
        </Text>
      </view>

      <Modal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Oops! Something went wrong"
        body="We're sorry, something went wrong. Please try again."
        template={ModalTemplate.Sad}
      />
    </scroll-view>
  );
}
