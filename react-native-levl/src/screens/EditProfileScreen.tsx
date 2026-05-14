import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import AppLoading from '@/components/AppLoading';
import AppText, { TextType } from '@/components/AppText';
import { Colors } from '@/constant/colors';
import { useGetProfile } from '@/usecase/profile/useGetProfile';
import { useUpdateProfile } from '@/usecase/profile/useUpdateProfile';

export default function EditProfileScreen() {
  const { profile, isLoading } = useGetProfile();
  const nameRef = useRef<AppInputRef>(null);
  const phoneRef = useRef<AppInputRef>(null);
  const bioRef = useRef<AppInputRef>(null);
  const locationRef = useRef<AppInputRef>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profile && !initialized) {
      nameRef.current?.setValue(profile.name ?? '');
      phoneRef.current?.setValue(profile.phone ?? '');
      bioRef.current?.setValue(profile.bio ?? '');
      locationRef.current?.setValue(profile.location ?? '');
      setInitialized(true);
    }
  }, [profile, initialized]);

  const { execute: updateProfile, isLoading: isSaving } = useUpdateProfile({
    onSuccess: () => {
      Alert.alert('Berhasil', 'Profil berhasil diperbarui.');
      router.back();
    },
    onError: () => {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan profil.');
    },
  });

  const handleSave = () => {
    updateProfile({
      name: nameRef.current?.getValue() ?? '',
      phone: phoneRef.current?.getValue() || undefined,
      bio: bioRef.current?.getValue() || undefined,
      location: locationRef.current?.getValue() || undefined,
    });
  };

  if (isLoading) return <AppLoading fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: Colors.Primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <AppText size={TextType.h2} fontWeight="bold">Edit Profil</AppText>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <AppText size={TextType.h3} fontWeight="bold" style={{ marginBottom: 12 }}>
              Informasi Akun
            </AppText>
            <AppInput title="Nama Lengkap" ref={nameRef} />
            <View style={{ height: 12 }} />
            <AppInput title="Nomor Telepon" ref={phoneRef} />
            <View style={{ height: 12 }} />
            <AppInput title="Lokasi" ref={locationRef} />
            <View style={{ height: 12 }} />
            <AppInput title="Bio" ref={bioRef} />
          </View>

          <AppButton
            label="Simpan"
            color="primary"
            onPress={handleSave}
            isLoading={isSaving}
            disabled={isSaving}
            style={{ marginTop: 8 }}
          />
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
  form: { padding: 16, gap: 8 },
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
});
