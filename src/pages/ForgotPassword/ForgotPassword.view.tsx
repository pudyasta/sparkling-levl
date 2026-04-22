import { useRef, useState } from '@lynx-js/react';

import { hiMascot } from '@/assets/images/mascot';
import { loginBanner } from '@/assets/images/pages';
import Input, { type InputRef } from '@/components/Input/Input';
import { Loading } from '@/components/Loading/Loading';
import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { useKeyboardShift } from '@/hooks/useKeyboardShift';
import { useLogin } from '@/pages/Login/usecase/useLogin';

export default function LoginPage() {
  const emailRef = useRef<InputRef>(null);
  const passwordRef = useRef<InputRef>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { navigateTo } = useNativeBridge();

  const { kbHeight } = useKeyboardShift('panel');

  const { execute, isLoading } = useLogin({
    onValidationError: (errors) => {
      if (errors.login) emailRef.current?.setError(errors.login);
      if (errors.password) passwordRef.current?.setError(errors.password);
    },
    onSuccess: () => {
      navigateTo('main.lynx.bundle', { hide_nav_bar: 1, close: true });
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

  return (
    <scroll-view
      scroll-orientation="vertical"
      id="panel"
      className="h-full w-full flex-1"
      style={{ paddingBottom: kbHeight > 0 ? '10vh' : '0px' }}
    >
      {/* Banner Section */}
      <view
        className="min-h-[35vh] flex-col items-end gap-5 bg-cover bg-bottom px-8 pl-5 pt-5 flex relative justify-end overflow-hidden"
        style={{
          backgroundImage: `url(${loginBanner})`,
        }}
      >
        <view className="w-full flex-col items-end gap-[10px] flex justify-end">
          <view className="h-14 w-14 items-center rounded-[16px] bg-white/20 flex justify-center">
            <Text size={TextType.h1}>📖</Text>
          </view>

          <Text color="white" fontWeight="bold" size={TextType.h1} fontFamily={FontFamily.jakarta}>
            Halo
          </Text>
          <Text color="white" size={TextType.b2}>
            Masuk dulu yuk buat mulai belajar lagi!
          </Text>
        </view>

        {/* Mascot Container */}
        <view className="w-full flex justify-start">
          <image src={hiMascot} className="h-[120px] w-[120px]" />
        </view>
      </view>

      {/* Form Section */}
      <view className="flex-col items-center gap-5 px-5 py-8 flex justify-center">
        <Input title="Email or username" variant="email" icon="mail" ref={emailRef} />

        <Text
          typeof={TextType.b1}
          className="self-end"
          style={{
            color: Colors.Primary,
          }}
          onClick={() => navigateTo('forgotPassword.lynx.bundle', { close: true })}
        >
          Lupa Password?
        </Text>

        <Button color="primary" onPress={loginUser} disabled={isLoading}>
          {isLoading ? <Loading size={32} /> : 'Sign In'}
        </Button>

        {/* Signup */}
        <Text
          typeof={TextType.b1}
          onClick={() => {
            navigateTo('register.lynx.bundle', { close: true });
          }}
        >
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
