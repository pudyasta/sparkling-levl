import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useChangeEmail,
  useDeleteAccountConfirm,
  useDeleteAccountRequest,
  useGetProfileSettings,
  useUpdatePassword,
  useUpdateProfile,
  useVerifyEmailChange,
} from '@/pages/ProfileSettings/usecase/useProfileSettings';

import Input, { type InputRef } from '../src/components/Input/Input';
import { Loading } from '../src/components/Loading/Loading';
import Text from '../src/components/Text';
import { TextType } from '../src/components/Text/types';
import Button from '../src/components/common/Button';
import { Colors } from '../src/constant/style';
import { useNativeBridge } from '../src/context/NativeBridgeProvider';

type Screen = 'profile' | 'security' | 'danger';

const TITLES: Record<Screen, string> = {
  profile: 'Edit Profil',
  security: 'Keamanan Akun',
  danger: 'Akun',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text size={TextType.h3} fontWeight="bold">
          {title}
        </Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function ProfileSettingsScreen() {
  const { screen: screenParam } = useLocalSearchParams<{ screen: Screen }>();
  const activeScreen: Screen = (screenParam as Screen) ?? 'profile';
  const { logout, user, setUser } = useNativeBridge();

  const { profile } = useGetProfileSettings();

  // ── Profile ──────────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');
      setBio(profile.bio ?? '');
      setLocation(profile.location ?? '');
    }
  }, [profile]);

  const { execute: updateProfile, isLoading: isSavingProfile } = useUpdateProfile({
    onSuccess: () => {
      if (user) setUser({ ...user, name });
    },
  });

  // ── Security ─────────────────────────────────────────────────────────────────
  const currentPassRef = useRef<InputRef>(null);
  const newPassRef = useRef<InputRef>(null);
  const confirmPassRef = useRef<InputRef>(null);

  const { execute: updatePassword, isLoading: isSavingPw } = useUpdatePassword({
    onValidationError: (errors) => {
      if (errors.current_password) currentPassRef.current?.setError(errors.current_password);
      if (errors.new_password) newPassRef.current?.setError(errors.new_password);
      if (errors.new_password_confirmation)
        confirmPassRef.current?.setError(errors.new_password_confirmation);
    },
  });

  const [newEmail, setNewEmail] = useState('');
  const [emailUuid, setEmailUuid] = useState<string | null>(null);
  const [emailToken, setEmailToken] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const { execute: changeEmail, isLoading: isSendingEmail } = useChangeEmail({
    onSuccess: (uuid) => {
      setEmailUuid(uuid ?? null);
      setEmailSent(true);
    },
  });

  const { execute: verifyEmail, isLoading: isVerifyingEmail } = useVerifyEmailChange({
    onSuccess: () => {
      setEmailSent(false);
      setEmailUuid(null);
      setNewEmail('');
    },
  });

  // ── Danger zone ───────────────────────────────────────────────────────────────
  const [deletePw, setDeletePw] = useState('');
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [deleteToken, setDeleteToken] = useState('');
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm'>('idle');

  const { execute: requestDelete, isLoading: isRequestingDelete } = useDeleteAccountRequest({
    onSuccess: (uuid) => {
      setDeleteUuid(uuid ?? null);
      setDeleteStep('confirm');
    },
  });

  const { execute: confirmDelete, isLoading: isConfirmingDelete } = useDeleteAccountConfirm({
    onSuccess: () => logout(),
  });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.Canvas }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text size={TextType.b1} color={Colors.Primary}>
            ← Kembali
          </Text>
        </TouchableOpacity>
        <Text size={TextType.h3} fontWeight="bold">
          {TITLES[activeScreen]}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {/* ══ PROFILE SCREEN ══ */}
          {activeScreen === 'profile' && (
            <Section title="Informasi Akun">
              <Input title="Nama Lengkap" initialValue={name} bindChange={setName} />
              <Input
                title="Nomor Telepon"
                initialValue={phone}
                variant="number"
                bindChange={setPhone}
              />
              <Input
                title="Lokasi"
                initialValue={location}
                placeholder="e.g. Jakarta, Indonesia"
                bindChange={setLocation}
              />
              <Input
                title="Bio"
                initialValue={bio}
                placeholder="Tell us about yourself"
                bindChange={setBio}
              />
              <Button
                disabled={isSavingProfile}
                onPress={() => updateProfile({ name, phone, bio, location })}
              >
                {isSavingProfile ? <Loading size={20} color="#fff" /> : 'Simpan'}
              </Button>
            </Section>
          )}

          {/* ══ SECURITY SCREEN ══ */}
          {activeScreen === 'security' && (
            <>
              <Section title="Ubah Password">
                <Input title="Password saat ini" variant="password" ref={currentPassRef} />
                <Input title="Password baru" variant="password" ref={newPassRef} />
                <Input title="Konfirmasi password baru" variant="password" ref={confirmPassRef} />
                <Button
                  disabled={isSavingPw}
                  onPress={() => {
                    currentPassRef.current?.setError(null);
                    newPassRef.current?.setError(null);
                    confirmPassRef.current?.setError(null);
                    updatePassword({
                      current_password: currentPassRef.current?.getValue() ?? '',
                      new_password: newPassRef.current?.getValue() ?? '',
                      new_password_confirmation: confirmPassRef.current?.getValue() ?? '',
                    });
                  }}
                >
                  {isSavingPw ? <Loading size={20} color="#fff" /> : 'Simpan'}
                </Button>
              </Section>

              <Section title="Ubah Email">
                {!emailSent ? (
                  <>
                    <Text size={TextType.b3} color={Colors.TextTertiary}>
                      Email saat ini: {profile?.email ?? '—'}
                    </Text>
                    <Input
                      title="Email baru"
                      initialValue={newEmail}
                      variant="email"
                      bindChange={setNewEmail}
                    />
                    <Button
                      disabled={isSendingEmail || !newEmail}
                      onPress={() => changeEmail({ new_email: newEmail })}
                    >
                      {isSendingEmail ? <Loading size={20} color="#fff" /> : 'Kirim verifikasi'}
                    </Button>
                  </>
                ) : (
                  <>
                    <View style={styles.infoBanner}>
                      <Text size={TextType.b3} color="#1D4ED8">
                        Email verifikasi dikirim ke {newEmail}.
                      </Text>
                    </View>
                    <Input
                      title="Verification token"
                      initialValue={emailToken}
                      bindChange={setEmailToken}
                    />
                    <Button
                      disabled={isVerifyingEmail || !emailToken || !emailUuid}
                      onPress={() => verifyEmail({ uuid: emailUuid!, token: emailToken })}
                    >
                      {isVerifyingEmail ? <Loading size={20} color="#fff" /> : 'Verifikasi email'}
                    </Button>
                    <TouchableOpacity
                      onPress={() => setEmailSent(false)}
                      style={{ alignItems: 'center' }}
                    >
                      <Text size={TextType.b3} color={Colors.TextTertiary}>
                        ← Gunakan email lainnya
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </Section>
            </>
          )}

          {/* ══ DANGER ZONE SCREEN ══ */}
          {activeScreen === 'danger' && (
            <>
              <Section title="Session">
                <Button onPress={() => logout()}>Logout</Button>
              </Section>

              <Section title="Hapus Akun">
                <View style={styles.dangerBanner}>
                  <Text size={TextType.b3} color="#DC2626">
                    Menghapus akun ini akan menghapus seluruh data Kamu. Apakah Kamu yakin?
                  </Text>
                </View>

                {deleteStep === 'idle' ? (
                  <>
                    <Input
                      title="Masukkan password Kamu"
                      variant="password"
                      initialValue={deletePw}
                      bindChange={setDeletePw}
                    />
                    <Button
                      disabled={isRequestingDelete || !deletePw}
                      onPress={() => requestDelete({ password: deletePw })}
                    >
                      {isRequestingDelete ? <Loading size={20} color="#fff" /> : 'Minta hapus akun'}
                    </Button>
                  </>
                ) : (
                  <>
                    <View style={styles.warnBanner}>
                      <Text size={TextType.b3} color="#92400E">
                        Konfirmasi token telah dikirim ke email Kamu. Masukkan token di bawah untuk
                        menghapus akun.
                      </Text>
                    </View>
                    <Input
                      title="Confirmation token"
                      initialValue={deleteToken}
                      bindChange={setDeleteToken}
                    />
                    <Button
                      disabled={isConfirmingDelete || !deleteToken || !deleteUuid}
                      onPress={() => confirmDelete({ uuid: deleteUuid!, token: deleteToken })}
                    >
                      {isConfirmingDelete ? (
                        <Loading size={20} color="#fff" />
                      ) : (
                        'Konfirmasi hapus akun'
                      )}
                    </Button>
                    <TouchableOpacity
                      onPress={() => setDeleteStep('idle')}
                      style={{ alignItems: 'center', padding: 8 }}
                    >
                      <Text size={TextType.b3} color={Colors.TextTertiary}>
                        Batalkan
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </Section>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 12,
    backgroundColor: Colors.Surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
  },
  backBtn: { padding: 4 },
  body: { padding: 16, gap: 16 },
  section: {
    backgroundColor: Colors.Surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Divider,
  },
  sectionBody: { padding: 20, gap: 16 },
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
  },
  dangerBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
  },
  warnBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
  },
});
