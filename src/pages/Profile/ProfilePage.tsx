import { useEffect, useRef, useState } from '@lynx-js/react';
import * as router from 'sparkling-navigation';

import { arrowBackBlack } from '@/assets/images/icon';
import { useConfirmation } from '@/components/ConfirmationModal/ConfitmationModal';
import Input, { type InputRef } from '@/components/Input/Input';
import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { callToast } from '@/lib/helper/showToast';

import type { ProfileVisibility, UpdatePrivacyPayload } from './repository/type';
import { useChangeEmail, useVerifyEmailChange } from './usecase/useChangeEmail';
import { useDeleteAccountConfirm, useDeleteAccountRequest } from './usecase/useDeleteAccount';
import { useGetPrivacy } from './usecase/useGetPrivacy';
import { useGetProfile } from './usecase/useGetProfile';
import { useUpdatePassword } from './usecase/useUpdatePassword';
import { useUpdatePrivacy } from './usecase/useUpdatePrivacy';
import { useUpdateProfile } from './usecase/useUpdateProfile';

type Screen = 'profile' | 'security' | 'privacy' | 'danger';

// ─── Shared section wrapper ───────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <view className="mb-4 rounded-2xl bg-white overflow-hidden">
    <view className="border-b border-slate-100 px-5 py-4">
      <Text size={TextType.h3} fontWeight="bold" className="text-slate-800">
        {title}
      </Text>
    </view>
    <view className="flex-col gap-4 px-5 py-4 flex">{children}</view>
  </view>
);

// ─── Toggle row ───────────────────────────────────────────────────────────────
const ToggleRow = ({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
}) => (
  <view className="flex-row items-center flex justify-between">
    <view className="mr-4 flex-1 flex-col flex">
      <Text size={TextType.b2} fontWeight="bold" className="text-slate-700">
        {label}
      </Text>
      {description && (
        <Text size={TextType.b3} className="mt-0.5 text-slate-400">
          {description}
        </Text>
      )}
    </view>
    <view
      bindtap={onToggle}
      className={`h-6 w-12 rounded-full justify-center ${value ? 'bg-[#1a73e8]' : 'bg-slate-200'}`}
      style={{ alignItems: value ? 'flex-end' : 'flex-start', padding: '2px' }}
    >
      <view className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </view>
  </view>
);

// ─── Back header ─────────────────────────────────────────────────────────────
export const BackHeader = ({ title }: { title: string }) => (
  <view className="flex-row items-center gap-3 border-b border-slate-100 bg-white px-4 py-4 flex">
    <view
      bindtap={() => router.close()}
      className="h-9 w-9 items-center rounded-full bg-slate-100 p-2 justify-center"
    >
      <CustomImage className="h-full w-full" src={arrowBackBlack} />
    </view>
    <Text size={TextType.h3} fontWeight="bold" className="text-slate-800">
      {title}
    </Text>
  </view>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { logout, routerParams, setUser, user } = useNativeBridge();
  const activeScreen = (routerParams?.screen as Screen) ?? 'profile';
  const { confirm, ConfirmationModal } = useConfirmation();

  // ── Profile data ──
  const { profile } = useGetProfile();
  const isLoading = false;
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
    onSuccess: (data) => {
      setUser({
        ...user,
        name,
      });
      callToast('Profil berhasil diberbarui!', 'success');
    },
  });

  // ── Security ──
  const currentPassRef = useRef<InputRef>(null);
  const newPassRef = useRef<InputRef>(null);
  const newPassConfirmRef = useRef<InputRef>(null);

  const { execute: updatePassword, isLoading: isSavingPw } = useUpdatePassword({
    onValidationError: (errors) => {
      if (errors.current_password) currentPassRef.current?.setError(errors.current_password);
      if (errors.new_password) newPassRef.current?.setError(errors.new_password);
      if (errors.new_password_confirmation)
        newPassConfirmRef.current?.setError(errors.new_password_confirmation);
    },
    onSuccess: () => {
      callToast('Berhasil mengubah kata sandi.', 'success');
    },
    onError: (err) => {
      callToast('Terjadi kesalahan saat mengubah kata sandi.', 'error');
    },
  });

  const handleUpdatePassword = () => {
    confirm(() => {
      if (!currentPassRef.current || !newPassConfirmRef.current || !newPassRef.current) {
        callToast('Terjadi apa saat mengubah kata sandi.', 'error');
        return;
      }
      currentPassRef.current?.setError('');
      newPassRef.current?.setError('');
      newPassConfirmRef.current?.setError('');
      updatePassword({
        current_password: currentPassRef.current?.getValue(),
        new_password: newPassRef.current?.getValue(),
        new_password_confirmation: newPassConfirmRef.current?.getValue(),
      });
    });
  };

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
    onSuccess: (data) => {
      setEmailSent(false);
      setEmailUuid(null);
      setNewEmail('');
    },
  });

  // ── Privacy ──
  const { privacy, isLoading: isLoadingPrivacy } = useGetPrivacy();
  const [privacyForm, setPrivacyForm] = useState<UpdatePrivacyPayload>({
    profile_visibility: 'public',
    show_email: false,
    show_phone: false,
    show_activity_history: true,
    show_achievements: true,
    show_statistics: true,
  });
  const [privacySaved, setPrivacySaved] = useState(false);

  useState(() => {
    if (privacy) setPrivacyForm(privacy as UpdatePrivacyPayload);
  });

  const { execute: updatePrivacy, isLoading: isSavingPrivacy } = useUpdatePrivacy({
    onSuccess: () => {
      setPrivacySaved(true);
      setTimeout(() => setPrivacySaved(false), 2000);
    },
  });

  // ── Danger zone ──
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

  if (isLoading || !profile) {
    return (
      <view className="h-full items-center flex justify-center">
        <Loading size={32} />
      </view>
    );
  }

  return (
    <view className="h-screen w-full flex-col bg-slate-50 flex">
      {activeScreen === 'profile' && (
        <view className="flex-1 flex-col bg-slate-50 flex" style={{ flex: 1 }}>
          <BackHeader title="Kembali" />
          <scroll-view className="flex-1 p-4" scroll-y>
            <Section title="Informasi Akun">
              <Input
                title="Nama Lengkap"
                initialValue={profile.name}
                bindChange={(e) => setName(e)}
              />
              {/* Disabled for first release */}
              <Input
                title="Nomor Telepon"
                initialValue={profile.phone}
                variant="number"
                bindChange={(e) => setPhone(e)}
              />
              <Input
                title="Lokasi"
                initialValue={location}
                placeholder="e.g. Jakarta, Indonesia"
                bindChange={(e) => setLocation(e)}
              />
              <Input
                title="Bio"
                initialValue={bio}
                placeholder="Tell us about yourself"
                bindChange={(e) => setBio(e)}
              />

              <Button
                disabled={isSavingProfile}
                onPress={() => updateProfile({ name, phone, bio, location })}
                isLoading={isSavingProfile}
              >
                Simpan
              </Button>
            </Section>

            {/* {profile.avatar_url && (
              <Section title="Avatar">
                <Button className="h-12 w-full rounded-2xl border-2 border-red-200">
                  <text className="font-bold text-red-400">Hapus Avatar Kamu</text>
                </Button>
              </Section>
            )} */}
            <view className="h-10" />
          </scroll-view>
        </view>
      )}

      {/* ════ SECURITY SCREEN ════ */}
      {activeScreen === 'security' && (
        <view className="flex-1 flex-col bg-slate-50 flex" style={{ flex: 1 }}>
          <BackHeader title="Kembali" />
          <scroll-view className="flex-1 p-4" scroll-y>
            <Section title="Ubah Password">
              <Input title="Password saat ini" variant="password" ref={currentPassRef} />
              <Input title="Password baru" variant="password" ref={newPassRef} />
              <Input title="Konfirmasi password baru" variant="password" ref={newPassConfirmRef} />
              <Button disabled={isSavingPw} onPress={handleUpdatePassword} isLoading={isSavingPw}>
                Simpan
              </Button>
            </Section>

            <Section title="Ubah email Anda">
              {!emailSent ? (
                <>
                  <Text size={TextType.b3} className="text-slate-400">
                    Email saat ini: {profile.email ?? '—'}
                  </Text>
                  <Input title="Email baru" initialValue={newEmail} variant="email" />
                  <Button
                    className="h-12 w-full"
                    disabled={isSendingEmail || !newEmail}
                    onPress={() => changeEmail({ new_email: newEmail })}
                    isLoading={isSendingEmail}
                  >
                    Kirim verifikasi
                  </Button>
                </>
              ) : (
                <>
                  <view className="rounded-xl bg-blue-50 p-3">
                    <text className="text-xs text-blue-600">
                      Email verifikasi telah dikirim ke email {newEmail}.
                    </text>
                  </view>
                  <Input title="Verification token" initialValue={emailToken} />
                  <Button
                    className="h-12 w-full"
                    disabled={isVerifyingEmail || !emailToken || !emailUuid}
                    onPress={() => verifyEmail({ uuid: emailUuid!, token: emailToken })}
                    isLoading={isVerifyingEmail}
                  >
                    Verifikasi email
                  </Button>
                  <view bindtap={() => setEmailSent(false)} className="items-center">
                    <text className="text-xs text-slate-400">← Gunakan email lainnya</text>
                  </view>
                </>
              )}
            </Section>
            <view className="h-10" />
          </scroll-view>
        </view>
      )}

      {/* Diabled */}
      {/* ════ PRIVACY SCREEN ════ */}
      {activeScreen === 'privacy' && (
        <view className="flex-1 flex-col bg-slate-50 flex" style={{ flex: 1 }}>
          <BackHeader title="Kembali" />
          <scroll-view className="flex-1 p-4" scroll-y>
            <Section title="Visibilitas profil Anda">
              {(['public', 'private', 'friends_only'] as ProfileVisibility[]).map((v) => (
                <view
                  key={v}
                  bindtap={() => setPrivacyForm((p) => ({ ...p, profile_visibility: v }))}
                  className={`flex-row items-center gap-3 rounded-xl border-2 p-4 flex ${
                    privacyForm.profile_visibility === v
                      ? 'border-[#1a73e8] bg-[#e8f0fe]'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <text>{v === 'public' ? '🌍' : v === 'private' ? '🔒' : '👥'}</text>
                  <Text
                    size={TextType.b2}
                    fontWeight={privacyForm.profile_visibility === v ? 'bold' : 'normal'}
                    className={
                      privacyForm.profile_visibility === v ? 'text-[#1a73e8]' : 'text-[#4b5563]'
                    }
                  >
                    {v === 'public' ? 'Public' : v === 'private' ? 'Private' : 'Friends only'}
                  </Text>
                </view>
              ))}
            </Section>

            <Section title="Visibility settings">
              {(
                [
                  {
                    key: 'show_email',
                    label: 'Tampilkan email',
                    desc: 'Pembaca dapat melihat email Anda',
                  },
                  {
                    key: 'show_phone',
                    label: 'Tampilkan number phone',
                    desc: 'Pembaca dapat melihat number phone Anda',
                  },
                  {
                    key: 'show_activity_history',
                    label: 'Tampilkan riwayat aktivitas',
                    desc: 'Tampilkan riwayat aktivitas Anda',
                  },
                  {
                    key: 'show_achievements',
                    label: 'Tampilkan penukaran',
                    desc: 'Tampilkan penukaran Anda',
                  },
                  {
                    key: 'show_statistics',
                    label: 'Tampilkan statistik',
                    desc: 'Tampilkan statistik Anda di profil Anda',
                  },
                ] as { key: keyof UpdatePrivacyPayload; label: string; desc: string }[]
              ).map((item) => (
                <ToggleRow
                  key={item.key}
                  label={item.label}
                  description={item.desc}
                  value={privacyForm[item.key] as boolean}
                  onToggle={() =>
                    setPrivacyForm((p) => ({
                      ...p,
                      [item.key]: !p[item.key as keyof UpdatePrivacyPayload],
                    }))
                  }
                />
              ))}
            </Section>

            {privacySaved && (
              <view className="mb-4 rounded-xl bg-green-50 p-3">
                <text className="text-xs font-bold text-green-600">Berhasil menypan perubahan</text>
              </view>
            )}

            <Button
              disabled={isSavingPrivacy}
              onPress={() => updatePrivacy(privacyForm)}
              isLoading={isSavingPrivacy}
            >
              Simpan
            </Button>
            <view className="h-10" />
          </scroll-view>
        </view>
      )}

      {/* ════ DANGER ZONE SCREEN ════ */}
      {activeScreen === 'danger' && (
        <view className="flex-1 flex-col bg-slate-50 flex" style={{ flex: 1 }}>
          <BackHeader title="Kembali" />
          <scroll-view className="flex-1 p-4" scroll-y>
            <Section title="Session">
              <Button onPress={() => confirm(() => logout())}>Logout</Button>
            </Section>

            {/* <Section title="Hapus akun">
              <view className="rounded-xl bg-red-50 p-4">
                <Text size={TextType.b3} className="text-red-500">
                  Menghapus akun ini akan menghapus seluruh data Kamu. Apakah Kamu yakin?
                </Text>
              </view>

              {deleteStep === 'idle' ? (
                <>
                  <Input
                    title="Masukkan password Kamu"
                    initialValue={deletePw}
                    variant="password"
                  />
                  <Button
                    disabled={isRequestingDelete || !deletePw}
                    onPress={() => requestDelete({ password: deletePw })}
                    isLoading={isRequestingDelete}
                  >
                    Minta hapus akun akun
                  </Button>
                </>
              ) : (
                <>
                  <view className="rounded-xl bg-amber-50 p-3">
                    <text className="text-xs text-amber-600">
                      Konfirmasi token telah dikirim ke email Kamu. Masukkan token ini di bawah ini
                      untuk menghapus akun Kamu.
                    </text>
                  </view>
                  <Input title="Confirmation token" initialValue={deleteToken} />
                  <Button
                    className="h-12 w-full rounded-2xl bg-red-600"
                    disabled={isConfirmingDelete || !deleteToken || !deleteUuid}
                    onPress={() => confirmDelete({ uuid: deleteUuid!, token: deleteToken })}
                    isLoading={isConfirmingDelete}
                  >
                    Konfirmasi hapus akun akun
                  </Button>
                  <view bindtap={() => setDeleteStep('idle')} className="items-center py-2">
                    <text className="text-xs text-slate-400">Batalkan</text>
                  </view>
                </>
              )}
            </Section> */}

            <view className="h-10" />
          </scroll-view>
        </view>
      )}

      <ConfirmationModal />
    </view>
  );
};

export default ProfilePage;
