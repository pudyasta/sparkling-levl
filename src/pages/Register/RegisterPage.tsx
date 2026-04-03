import { useRef, useState } from '@lynx-js/react';
import Input, { type InputRef } from '@/components/Input/Input';
import Button from '@/components/common/Button';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { useKeyboardShift } from '@/hooks/useKeyboardShift';
import { useRegister } from '@/pages/Register/usecase/useRegister';
import { searchMascot } from '@/assets/images/mascot';
import { loginBanner } from '@/assets/images/pages/';
import { Colors } from '@/constant/style';
import style from './RegisterPage.module.css';
import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import { Loading } from '@/components/Loading/Loading';
import * as router from 'sparkling-navigation';

export default function RegisterPage() {
  const emailRef = useRef<InputRef>(null);
  const usernameRef = useRef<InputRef>(null);
  const nameRef = useRef<InputRef>(null);
  const passwordRef = useRef<InputRef>(null);
  const confirmPasswordRef = useRef<InputRef>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { kbHeight } = useKeyboardShift('panel');
  const { isLoading, error, execute } = useRegister({
    onSuccess: () => {
      router.navigate(
        {
          path: 'emailConfirmation.lynx.bundle',
          options: {
            params: {
              title: 'Email Confirmation',
              hide_nav_bar: 1,
            },
          },
        },
        (result: router.OpenResponse) => {}
      );
    },
    onValidationError: (errors) => {
      if (errors) {
        emailRef.current?.setError(errors.email);
        usernameRef.current?.setError(errors.username);
        nameRef.current?.setError(errors.name);
        passwordRef.current?.setError(errors.password);
        confirmPasswordRef.current?.setError(errors.confirmPassword);
      }
    },
  });

  function registerUser() {
    emailRef.current?.setError(null);
    passwordRef.current?.setError(null);
    usernameRef.current?.setError(null);
    nameRef.current?.setError(null);
    confirmPasswordRef.current?.setError(null);

    execute({
      email: emailRef.current?.getValue() || '',
      username: usernameRef.current?.getValue() || '',
      name: nameRef.current?.getValue() || '',
      password: passwordRef.current?.getValue() || '',
      password_confirmation: confirmPasswordRef.current?.getValue() || '',
    });
  }

  // DEBUG ONLY: Auto-fill form for testing
  function autoFillForm() {
    execute({
      email: `test${Date.now().toString().slice(-4)}@example.com`,
      username: `testuser${Date.now().toString().slice(-4)}`,
      name: 'Test User',
      password: 'Coba-123456',
      password_confirmation: 'Coba-123456',
    });
  }

  return (
    <scroll-view
      scroll-orientation="vertical"
      style={{
        width: '100%',
        height: '100%',
        paddingBottom: kbHeight > 0 ? `${kbHeight}px` : '0px',
      }}
      id="panel"
    >
      <view
        style={{
          backgroundImage: `url(${loginBanner})`,
        }}
        className={style.banner}
      >
        <view className={style.header}>
          <view className={style.headerLogo}>
            <Text size={TextType.h1}>📖</Text>
          </view>

          <Text size={TextType.h1} color="white" bold>
            Welcome Explorer!
          </Text>
          <Text size={TextType.b2} color="white">
            Discover a new world with Levl!
          </Text>
        </view>
        <view className={style.mascotContainer}>
          <image src={searchMascot} className={style.mascot} />
        </view>
      </view>
      <view className={style.formContainer}>
        <Input title="Name" variant="text" icon="user" ref={nameRef} />
        <Input title="Email" variant="email" icon="mail" ref={emailRef} />
        <Input title="Username" variant="text" icon="user" ref={usernameRef} />
        <Input title="Password" variant="password" icon="lock" ref={passwordRef} />
        <Input title="Confirm Password" variant="password" icon="lock" ref={confirmPasswordRef} />

        <Button color="blue" variant="solid" onPress={autoFillForm} disabled={isLoading}>
          {isLoading ? <Loading size={32} /> : 'Sign Up'}
        </Button>
        {/* Signup */}
        <Text
          typeof={TextType.b1}
          onClick={() =>
            router.navigate(
              {
                path: 'login.lynx.bundle',
                options: {
                  params: {
                    title: 'Home',
                    hide_nav_bar: 1,
                  },
                },
              },
              (result: router.OpenResponse) => {}
            )
          }
        >
          Udah punya akun?{' '}
          <Text typeof={TextType.b1} style={{ color: Colors.Primary }}>
            Masuk disini
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
