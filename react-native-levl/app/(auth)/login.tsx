import { useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { hiMascot } from '../../src/assets/images/mascot';
import { loginBanner } from '../../src/assets/images/pages';
import Input, { type InputRef } from '../../src/components/Input/Input';
import { Loading } from '../../src/components/Loading/Loading';
import { Modal, ModalTemplate } from '../../src/components/Modal/Modal.view';
import Text from '../../src/components/Text';
import { FontFamily, TextType } from '../../src/components/Text/types';
import Button from '../../src/components/common/Button';
import { Colors } from '../../src/constant/style';
import { useNativeBridge } from '../../src/context/NativeBridgeProvider';
import { useLogin } from '../../src/pages/Login/usecase/useLogin';

export default function LoginScreen() {
  const emailRef = useRef<InputRef>(null);
  const passwordRef = useRef<InputRef>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { navigateTo } = useNativeBridge();

  const { execute, isLoading } = useLogin({
    onValidationError: (errors) => {
      if (errors.login) emailRef.current?.setError(errors.login);
      if (errors.password) passwordRef.current?.setError(errors.password);
    },
    onSuccess: () => navigateTo('/(main)/home', { replace: true }),
    onError: (error) => {
      if (error.type !== 'VALIDATION_ERROR') setIsModalOpen(true);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* Banner Section */}
        <ImageBackground source={loginBanner} style={styles.banner} resizeMode="cover">
          <View style={styles.bannerContent}>
            <View style={styles.logoBox}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text
              color="white"
              fontWeight="bold"
              size={TextType.h1}
              fontFamily={FontFamily.jakarta}
            >
              Halo
            </Text>
            <Text color="white" size={TextType.b2}>
              Masuk dulu yuk buat mulai belajar lagi!
            </Text>
          </View>
          <View style={{ alignSelf: 'flex-start' }}>
            <Image source={hiMascot} style={{ height: 120, width: 120 }} resizeMode="contain" />
          </View>
        </ImageBackground>

        {/* Form Section */}
        <View style={styles.form}>
          <Input title="Email atau username" variant="email" icon="mail" ref={emailRef} />
          <Input title="Password" variant="password" icon="lock" ref={passwordRef} />

          <Button color="primary" onPress={loginUser} disabled={isLoading}>
            {isLoading ? <Loading size={24} color="#fff" /> : 'Masuk'}
          </Button>

          <TouchableOpacity onPress={() => navigateTo('/(auth)/register', { replace: true })}>
            <Text typeof={TextType.b1} style={{ textAlign: 'center' }}>
              Belum punya akun?{' '}
              <Text typeof={TextType.b1} style={{ color: Colors.Primary }}>
                Daftar disini
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Oops! Ada kesalahan pada permintaan kamu"
          body="We're sorry, something went wrong. Please try again."
          template={ModalTemplate.Sad}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 300,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 20,
    gap: 12,
  },
  bannerContent: {
    alignItems: 'flex-end',
    gap: 10,
  },
  logoBox: {
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
  },
  logo: { height: '100%', width: '100%' },
  form: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
});
