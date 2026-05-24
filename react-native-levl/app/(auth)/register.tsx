import { useRef, useState } from 'react';
import {
  Image, ImageBackground, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, TouchableOpacity, View,
} from 'react-native';
import { searchMascot } from '@/assets/images/mascot';
import { loginBanner } from '@/assets/images/pages';
import Input, { type InputRef } from '@/components/Input/Input';
import { Loading } from '@/components/Loading/Loading';
import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { useRegister } from '@/pages/Register/usecase/useRegister';

export default function RegisterScreen() {
  const emailRef = useRef<InputRef>(null);
  const usernameRef = useRef<InputRef>(null);
  const nameRef = useRef<InputRef>(null);
  const passwordRef = useRef<InputRef>(null);
  const confirmPasswordRef = useRef<InputRef>(null);
  const { navigateTo } = useNativeBridge();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isLoading, execute } = useRegister({
    onSuccess: () => navigateTo('/(auth)/email-confirmation', { replace: true }),
    onValidationError: (errors) => {
      if (errors) {
        emailRef.current?.setError(errors.email);
        usernameRef.current?.setError(errors.username);
        nameRef.current?.setError(errors.name);
        passwordRef.current?.setError(errors.password);
        confirmPasswordRef.current?.setError(errors.confirmPassword);
      }
    },
    onError: () => setIsModalOpen(true),
  });

  const registerUser = () => {
    [emailRef, passwordRef, usernameRef, nameRef, confirmPasswordRef].forEach(
      (r) => r.current?.setError(null)
    );
    execute({
      email: emailRef.current?.getValue() || '',
      username: usernameRef.current?.getValue() || '',
      name: nameRef.current?.getValue() || '',
      password: passwordRef.current?.getValue() || '',
      password_confirmation: confirmPasswordRef.current?.getValue() || '',
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        <ImageBackground source={loginBanner} style={styles.banner} resizeMode="cover">
          <View style={styles.bannerContent}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={{ height: 56, width: 56 }}
              resizeMode="contain"
            />
            <Text size={TextType.h1} color="white" fontWeight="bold">Welcome Explorer!</Text>
            <Text size={TextType.b2} color="white">Discover a new world with Levl!</Text>
          </View>
          <View style={{ alignSelf: 'flex-end' }}>
            <Image source={searchMascot} style={{ height: 120, width: 140 }} resizeMode="contain" />
          </View>
        </ImageBackground>

        <View style={styles.form}>
          <Input title="Name" variant="text" ref={nameRef} />
          <Input title="Email" variant="email" ref={emailRef} />
          <Input title="Username" variant="text" ref={usernameRef} />
          <Input title="Password" variant="password" ref={passwordRef} />
          <Input title="Confirm Password" variant="password" ref={confirmPasswordRef} />

          <Button onPress={registerUser} disabled={isLoading}>
            {isLoading ? <Loading size={24} color="#fff" /> : 'Sign Up'}
          </Button>

          <TouchableOpacity onPress={() => navigateTo('/(auth)/login', { replace: true })}>
            <Text typeof={TextType.b1} style={{ textAlign: 'center' }}>
              Udah punya akun?{' '}
              <Text typeof={TextType.b1} style={{ color: Colors.Primary }}>Masuk disini</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Oops! Something went wrong"
          body="We're sorry, something went wrong. Please try again."
          template={ModalTemplate.Sad}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  banner: { minHeight: 280, flexDirection: 'column', justifyContent: 'flex-end', padding: 20, gap: 12 },
  bannerContent: { alignItems: 'flex-start', gap: 10 },
  form: { padding: 20, gap: 16, paddingBottom: 40 },
});
