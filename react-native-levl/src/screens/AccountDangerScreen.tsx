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
import { useAuth } from '@/context/AuthContext';
import { useDeleteAccountConfirm, useDeleteAccountRequest } from '@/usecase/profile/useDeleteAccount';

export default function AccountDangerScreen() {
  const { logout } = useAuth();
  const deletePwRef = useRef<AppInputRef>(null);
  const deleteTokenRef = useRef<AppInputRef>(null);
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm'>('idle');
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);

  const { execute: requestDelete, isLoading: isRequestingDelete } = useDeleteAccountRequest({
    onSuccess: (uuid) => {
      setDeleteUuid(uuid ?? null);
      setDeleteStep('confirm');
    },
    onError: () => {
      Alert.alert('Gagal', 'Terjadi kesalahan. Pastikan password kamu benar.');
    },
  });

  const { execute: confirmDelete, isLoading: isConfirmingDelete } = useDeleteAccountConfirm({
    onSuccess: () => {
      logout();
    },
    onError: () => {
      Alert.alert('Gagal', 'Token tidak valid atau sudah kadaluwarsa.');
    },
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah kamu yakin ingin logout?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleRequestDelete = () => {
    const pw = deletePwRef.current?.getValue() ?? '';
    if (!pw) {
      Alert.alert('Peringatan', 'Masukkan password kamu terlebih dahulu.');
      return;
    }
    Alert.alert(
      'Hapus Akun',
      'Menghapus akun akan menghapus seluruh data kamu secara permanen. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lanjutkan',
          style: 'destructive',
          onPress: () => requestDelete({ password: pw }),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: Colors.Primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <AppText size={TextType.h2} fontWeight="bold">Akun</AppText>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <AppText size={TextType.h3} fontWeight="bold" style={{ marginBottom: 12 }}>
              Sesi
            </AppText>
            <AppButton
              label="Logout"
              color="primary"
              variant="outlined"
              onPress={handleLogout}
            />
          </View>

          <View style={[styles.section, styles.dangerSection]}>
            <AppText size={TextType.h3} fontWeight="bold" style={{ marginBottom: 8 }}>
              Hapus Akun
            </AppText>
            <View style={styles.warningBox}>
              <AppText size={TextType.b3} color={Colors.Error}>
                Menghapus akun ini akan menghapus seluruh data kamu secara permanen. Tindakan ini tidak dapat dibatalkan.
              </AppText>
            </View>

            {deleteStep === 'idle' ? (
              <>
                <View style={{ marginTop: 16 }}>
                  <AppInput title="Masukkan password kamu" variant="password" ref={deletePwRef} />
                </View>
                <View style={{ height: 12 }} />
                <AppButton
                  label="Minta Hapus Akun"
                  color="primary"
                  onPress={handleRequestDelete}
                  isLoading={isRequestingDelete}
                  disabled={isRequestingDelete}
                  style={{ backgroundColor: Colors.Error, borderColor: Colors.Error }}
                />
              </>
            ) : (
              <>
                <View style={styles.infoBox}>
                  <AppText size={TextType.b3} color="#92400E">
                    Token konfirmasi telah dikirim ke email kamu. Masukkan token di bawah untuk menghapus akun.
                  </AppText>
                </View>
                <View style={{ marginTop: 12 }}>
                  <AppInput title="Confirmation token" ref={deleteTokenRef} />
                </View>
                <View style={{ height: 12 }} />
                <AppButton
                  label="Konfirmasi Hapus Akun"
                  color="primary"
                  onPress={() => {
                    const token = deleteTokenRef.current?.getValue() ?? '';
                    if (!token || !deleteUuid) return;
                    confirmDelete({ uuid: deleteUuid, token });
                  }}
                  isLoading={isConfirmingDelete}
                  disabled={isConfirmingDelete}
                  style={{ backgroundColor: Colors.Error, borderColor: Colors.Error }}
                />
                <TouchableOpacity
                  onPress={() => setDeleteStep('idle')}
                  style={{ alignItems: 'center', marginTop: 12, paddingVertical: 8 }}
                >
                  <AppText size={TextType.b3} color={Colors.Disabled}>Batalkan</AppText>
                </TouchableOpacity>
              </>
            )}
          </View>
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
  dangerSection: {
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  infoBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
});
