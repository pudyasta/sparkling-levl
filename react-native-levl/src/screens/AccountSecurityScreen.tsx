import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import AppInput, { type AppInputRef } from '@/components/AppInput';
import AppText, { TextType } from '@/components/AppText';
import { Colors } from '@/constant/colors';
import { useGetProfile } from '@/usecase/profile/useGetProfile';
import { useUpdatePassword } from '@/usecase/profile/useUpdatePassword';

export default function AccountSecurityScreen() {
  const { profile } = useGetProfile();
  const currentPassRef = useRef<AppInputRef>(null);
  const newPassRef = useRef<AppInputRef>(null);
  const confirmPassRef = useRef<AppInputRef>(null);

  const { execute: updatePassword, isLoading: isSavingPw } = useUpdatePassword({
    onValidationError: (errors) => {
      if (errors.current_password) currentPassRef.current?.setError(errors.current_password);
      if (errors.new_password) newPassRef.current?.setError(errors.new_password);
      if (errors.new_password_confirmation) confirmPassRef.current?.setError(errors.new_password_confirmation);
    },
    onSuccess: () => {
      currentPassRef.current?.setValue('');
      newPassRef.current?.setValue('');
      confirmPassRef.current?.setValue('');
      Alert.alert('Berhasil', 'Password berhasil diubah.');
    },
    onError: () => {
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengubah password. Pastikan password saat ini benar.');
    },
  });

  const handleUpdatePassword = () => {
    currentPassRef.current?.setError(null);
    newPassRef.current?.setError(null);
    confirmPassRef.current?.setError(null);
    updatePassword({
      current_password: currentPassRef.current?.getValue() ?? '',
      new_password: newPassRef.current?.getValue() ?? '',
      new_password_confirmation: confirmPassRef.current?.getValue() ?? '',
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: Colors.Primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <AppText size={TextType.h2} fontWeight="bold">Keamanan Akun</AppText>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <AppText size={TextType.h3} fontWeight="bold" style={{ marginBottom: 4 }}>
              Ubah Password
            </AppText>
            <AppText size={TextType.b3} color={Colors.Disabled} style={{ marginBottom: 16 }}>
              Buat password baru yang kuat untuk melindungi akun kamu.
            </AppText>
            <AppInput title="Password saat ini" variant="password" ref={currentPassRef} />
            <View style={{ height: 12 }} />
            <AppInput title="Password baru" variant="password" ref={newPassRef} />
            <View style={{ height: 12 }} />
            <AppInput title="Konfirmasi password baru" variant="password" ref={confirmPassRef} />
            <View style={{ height: 16 }} />
            <AppButton
              label="Simpan Password"
              color="primary"
              onPress={handleUpdatePassword}
              isLoading={isSavingPw}
              disabled={isSavingPw}
            />
          </View>

          {profile?.email && (
            <View style={styles.infoBox}>
              <Text style={{ fontSize: 16, marginBottom: 4 }}>✉️</Text>
              <AppText size={TextType.b3} color={Colors.Disabled}>
                Email aktif: {profile.email}
              </AppText>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.Accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoBox: {
    backgroundColor: Colors.Accent,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
});
