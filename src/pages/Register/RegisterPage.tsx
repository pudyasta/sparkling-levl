import { useRef, useState } from '@lynx-js/react';

import { searchMascot } from '@/assets/images/mascot';
import { loginBanner } from '@/assets/images/pages/';
import Input, { type InputRef } from '@/components/Input/Input';
import { Loading } from '@/components/Loading/Loading';
import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { useKeyboardShift } from '@/hooks/useKeyboardShift';
import { useRegister } from '@/pages/Register/usecase/useRegister';

export default function RegisterPage() {
  const emailRef = useRef<InputRef>(null);
  const usernameRef = useRef<InputRef>(null);
  const nameRef = useRef<InputRef>(null);
  const passwordRef = useRef<InputRef>(null);
  const confirmPasswordRef = useRef<InputRef>(null);
  const { navigateTo } = useNativeBridge();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { kbHeight } = useKeyboardShift('panel');
  const { isLoading, error, execute } = useRegister({
    onSuccess: () => {
      navigateTo('emailConfirmation.lynx.bundle', { close: true });
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
      className="h-full w-full flex-1"
      style={{
        paddingBottom: kbHeight > 0 ? `${kbHeight}px` : '0px',
      }}
      id="panel"
    >
      {/* Banner Section */}
      <view
        className="min-h-[35vh] flex-col items-end gap-3 bg-cover bg-bottom pl-5 pr-8 pt-5 flex relative justify-end overflow-hidden"
        style={{
          backgroundImage: `url(${loginBanner})`,
        }}
      >
        {/* Header Section - Note: items-start based on your CSS */}
        <view className="w-full flex-col items-start gap-[10px] flex">
          <view className="h-14 w-14 items-center rounded-[16px] bg-white/20 flex justify-center">
            <Text size={TextType.h1}>📖</Text>
          </view>

          <Text size={TextType.h1} color="white" fontWeight="bold">
            Welcome Explorer!
          </Text>
          <Text size={TextType.b2} color="white">
            Discover a new world with Levl!
          </Text>
        </view>

        {/* Mascot Container - Note: justify-end based on your CSS */}
        <view className="w-full flex justify-end">
          <image src={searchMascot} className="h-[120px] w-[140px]" />
        </view>
      </view>

      {/* Form Section */}
      <view className="flex-col items-center gap-4 px-5 py-8 flex justify-center animate-fade-in">
        <Input title="Name" variant="text" icon="user" ref={nameRef} />
        <Input title="Email" variant="email" icon="mail" ref={emailRef} />
        <Input title="Username" variant="text" icon="user" ref={usernameRef} />
        <Input title="Password" variant="password" icon="lock" ref={passwordRef} />
        <Input title="Confirm Password" variant="password" icon="lock" ref={confirmPasswordRef} />

        <Button onPress={autoFillForm} disabled={isLoading}>
          {isLoading ? <Loading size={32} /> : 'Sign Up'}
        </Button>

        {/* Login Redirect */}
        <Text typeof={TextType.b1} onClick={() => navigateTo('login.lynx.bundle', { close: true })}>
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
