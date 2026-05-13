import { useEffect, useState } from '@lynx-js/react';

import Input from '@/components/Input/Input';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import Shimmer from '@/components/common/Shimmer/Shimmer';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { pickAnyFile } from '@/lib/helper/filePicker';

import type { ProfileResource, ProfileVisibility, UpdatePrivacyPayload } from './repository/type';
import { useChangeEmail, useVerifyEmailChange } from './usecase/useChangeEmail';
import { useDeleteAccountConfirm, useDeleteAccountRequest } from './usecase/useDeleteAccount';
import { useGetPrivacy } from './usecase/useGetPrivacy';
import { useGetProfile } from './usecase/useGetProfile';
import { useUpdatePassword } from './usecase/useUpdatePassword';
import { useUpdatePrivacy } from './usecase/useUpdatePrivacy';
import { useUpdateProfile } from './usecase/useUpdateProfile';

type Screen = 'menu' | 'profile' | 'security' | 'privacy' | 'danger';

// ─── Slide screen wrapper (pure Tailwind CSS transitions) ─────────────────────
// `mounted` keeps the node alive during the exit animation.
// `visible` is flipped one RAF after mount so CSS always sees the start state first.
const SlideScreen = ({ active, children }: { active: boolean; children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(active);
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!mounted) return null;

  return (
    <view
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      className={`bg-canvas transition-all duration-300 ease-in-out ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      {children}
    </view>
  );
};

// ─── Shared section wrapper ───────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <view className="mb-4 rounded-2xl bg-surface overflow-hidden">
    <view className="border-b border-light px-5 py-4">
      <Text size={TextType.h3} fontWeight="bold" className="text-neutral">
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
      <Text size={TextType.b2} fontWeight="bold" className="text-neutral">
        {label}
      </Text>
      {description && (
        <Text size={TextType.b3} className="mt-0.5 text-subtle">
          {description}
        </Text>
      )}
    </view>
    <view
      bindtap={onToggle}
      className={`h-6 w-12 rounded-full justify-center ${value ? 'bg-primary' : 'bg-surface-alt'}`}
      style={{ alignItems: value ? 'flex-end' : 'flex-start', padding: '2px' }}
    >
      <view className="h-5 w-5 rounded-full bg-surface shadow-sm" />
    </view>
  </view>
);

// ─── Settings menu item ───────────────────────────────────────────────────────
const MenuItem = ({
  emoji,
  label,
  description,
  onPress,
  isLast,
}: {
  emoji: string;
  label: string;
  description: string;
  onPress: () => void;
  isLast?: boolean;
}) => (
  <view
    bindtap={onPress}
    className={`flex-row items-center gap-4 bg-surface px-5 py-4 flex ${
      !isLast ? 'border-b border-light' : ''
    }`}
  >
    <view className="h-10 w-10 items-center rounded-full bg-surface-alt justify-center">
      <text className="text-lg">{emoji}</text>
    </view>
    <view className="flex-1 flex-col flex">
      <Text size={TextType.b1} fontWeight="bold" className="text-neutral">
        {label}
      </Text>
      <Text size={TextType.b3} className="text-subtle">
        {description}
      </Text>
    </view>
    <text className="text-lg text-subtle">›</text>
  </view>
);

// ─── Back header ─────────────────────────────────────────────────────────────
const BackHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <view className="flex-row items-center gap-3 border-b border-light bg-surface px-4 py-4 flex">
    <view
      bindtap={onBack}
      className="h-9 w-9 items-center rounded-full bg-surface-alt justify-center"
    >
      <Text size={TextType.h2} fontWeight="bold">
        ‹
      </Text>
    </view>
    <Text size={TextType.h3} fontWeight="bold" className="text-neutral">
      {title}
    </Text>
  </view>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { logout, navigateTo } = useNativeBridge();
  const [activeScreen, setActiveScreen] = useState<Screen>('menu');

  // ── Profile data ──
  const { profile } = useGetProfile();
  const isLoading = false;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  useState(() => {
    if (profile) {
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');
      setBio(profile.bio ?? '');
      setLocation(profile.location ?? '');
    }
  });

  const { execute: updateProfile, isLoading: isSavingProfile } = useUpdateProfile({
    onSuccess: () => {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    },
  });

  // ── Security ──
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const { execute: updatePassword, isLoading: isSavingPw } = useUpdatePassword({
    onSuccess: () => {
      setPwSuccess(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setTimeout(() => setPwSuccess(false), 2000);
    },
    onError: () => setPwError('Current password is incorrect.'),
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

  const handlePickAvatar = () => {
    pickAnyFile('image', (res) => {
      const file = res?.tempFiles?.[0];
      if (!file) return;
    });
  };

  if (isLoading || !profile) {
    return (
      <view className="h-screen w-full flex-col bg-canvas flex">
        {/* Hero skeleton */}
        <view className="bg-primary px-5 pb-6 pt-12">
          <view className="flex-row items-center gap-4 flex">
            {/* Avatar circle */}
            <Shimmer isRound width={80} height={80} />
            {/* Name + username + badge */}
            <view className="flex-1 flex-col gap-2 flex">
              <Shimmer height={20} width={140} />
              <Shimmer height={14} width={100} />
              <Shimmer height={16} width={60} borderRadius={99} />
            </view>
          </view>
          {/* Stats row */}
          <view className="mt-4 flex-row gap-3 flex">
            {[1, 2, 3, 4].map((i) => (
              <view
                key={i}
                className="flex-1 flex-col items-center gap-1 rounded-xl bg-blue-500/30 py-3 flex"
              >
                <Shimmer height={20} width={32} />
                <Shimmer height={12} width={48} />
              </view>
            ))}
          </view>
        </view>

        {/* Menu list skeleton */}
        <view className="flex-1 p-4">
          {/* Section label */}
          <Shimmer height={10} width={120} className="mx-1 mb-3" />
          <view className="rounded-2xl bg-surface overflow-hidden">
            {[1, 2, 3, 4].map((i, idx) => (
              <view
                key={i}
                className={`flex-row items-center gap-4 px-5 py-4 flex ${idx < 3 ? 'border-b border-light' : ''}`}
              >
                {/* Icon circle */}
                <Shimmer isRound width={40} height={40} />
                {/* Label + description */}
                <view className="flex-1 flex-col gap-1.5 flex">
                  <Shimmer height={14} width={100} />
                  <Shimmer height={11} width={160} />
                </view>
                {/* Chevron */}
                <Shimmer height={14} width={8} />
              </view>
            ))}
          </view>
        </view>
      </view>
    );
  }

  return (
    <view
      className="h-screen w-full bg-canvas"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* ════ MENU SCREEN — always mounted as the base layer ════ */}
      <view
        className="flex-col bg-canvas"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flex: 1 }}
      >
        {/* Hero header */}
        <view className="bg-primary px-5 pb-6 pt-12">
          <view className="flex-row items-center gap-4 flex">
            <view className="relative">
              <view className="h-20 w-20 items-center rounded-full bg-primary justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <image src={profile.avatar_url} className="h-full w-full" />
                ) : (
                  <text className="text-3xl font-bold text-white">
                    {profile.name?.charAt(0)?.toUpperCase()}
                  </text>
                )}
              </view>
              <view
                bindtap={handlePickAvatar}
                className="h-7 w-7 items-center rounded-full bg-surface absolute -bottom-1 -right-1 justify-center shadow-md"
              >
                <text className="text-xs">📷</text>
              </view>
            </view>

            <view className="flex-1 flex-col flex">
              <Text size={TextType.h2} fontWeight="bold" className="text-white">
                {profile.name}
              </Text>
              <Text size={TextType.b2} className="text-blue-200">
                @{profile.username}
              </Text>
              <view className="mt-1 self-start rounded-full bg-primary px-2 py-0.5">
                <text className="uppercase text-caption font-bold text-blue-100">
                  {profile.role}
                </text>
              </view>
            </view>
          </view>

          {profile.statistics && (
            <view className="mt-4 flex-row gap-3 flex">
              {[
                { label: 'Courses', value: profile.statistics.total_courses },
                { label: 'Completed', value: profile.statistics.completed_courses },
                { label: 'XP', value: profile.statistics.total_xp },
                { label: 'Level', value: profile.statistics.current_level },
              ].map((stat) => (
                <view
                  key={stat.label}
                  className="flex-1 items-center rounded-xl bg-blue-500/50 py-2"
                >
                  <Text size={TextType.h3} fontWeight="bold" className="text-white">
                    {stat.value}
                  </Text>
                  <Text size={TextType.b3} className="text-blue-200">
                    {stat.label}
                  </Text>
                </view>
              ))}
            </view>
          )}
        </view>

        {/* Settings list */}
        <scroll-view className="flex-1 p-4" scroll-y>
          <Text
            size={TextType.b3}
            fontWeight="bold"
            className="uppercase mb-2 px-1 tracking-wider text-subtle"
          >
            Account Settings
          </Text>
          <view className="mb-4 rounded-2xl overflow-hidden">
            <MenuItem
              emoji="👤"
              label="Edit Profil"
              description="Ubah informasi profil Kamu"
              onPress={() => setActiveScreen('profile')}
            />
            <MenuItem
              emoji="🔐"
              label="Keamanan Akun"
              description="Ubah password dan email Kamu"
              onPress={() => setActiveScreen('security')}
            />
            <MenuItem
              emoji="👁️"
              label="Privasi"
              description="Atur privasi Kamu"
              onPress={() => setActiveScreen('privacy')}
            />
            <MenuItem
              emoji="⚠️"
              label="Akun"
              description="Logout atau hapus akun Kamu"
              onPress={() => setActiveScreen('danger')}
              isLast
            />
          </view>
          <view className="h-10" />
        </scroll-view>
      </view>

      {/* ════ PROFILE SCREEN ════ */}
      <SlideScreen active={activeScreen === 'profile'}>
        <view className="flex-1 flex-col bg-canvas flex" style={{ flex: 1 }}>
          <BackHeader title="Edit Profil Akun" onBack={() => setActiveScreen('menu')} />
          <scroll-view className="flex-1 p-4" scroll-y>
            <Section title="Informasi Akun">
              <Input title="Nama Lengkap" initialValue={profile.name} />
              <Input title="Nomor Telepon" initialValue={profile.phone} />
              <Input title="Lokasi" initialValue={location} placeholder="e.g. Jakarta, Indonesia" />
              <Input title="Bio" initialValue={bio} placeholder="Tell us about yourself" />

              {profileSaved && (
                <view className="rounded-xl bg-green-50 p-3">
                  <text className="text-xs font-bold text-green-600">
                    Berhasil menyimpan perubahan
                  </text>
                </view>
              )}

              <Button
                className="h-12 w-full rounded-2xl bg-primary"
                disabled={isSavingProfile}
                onPress={() => updateProfile({ name, phone, bio, location })}
                isLoading={isSavingProfile}
              >
                Simpan
              </Button>
            </Section>

            {profile.avatar_url && (
              <Section title="Avatar">
                <Button className="h-12 w-full rounded-2xl border-2 border-red-200">
                  <text className="font-bold text-red-400">Hapus Avatar Kamu</text>
                </Button>
              </Section>
            )}
            <view className="h-10" />
          </scroll-view>
        </view>
      </SlideScreen>

      {/* ════ SECURITY SCREEN ════ */}
      <SlideScreen active={activeScreen === 'security'}>
        <view className="flex-1 flex-col bg-canvas flex" style={{ flex: 1 }}>
          <BackHeader title="Keamanan Akun" onBack={() => setActiveScreen('menu')} />
          <scroll-view className="flex-1 p-4" scroll-y>
            <Section title="Ubah Password">
              <Input title="Password saat ini" initialValue={currentPw} variant="password" />
              <Input title="Password baru" initialValue={newPw} variant="password" />
              <Input title="Konfirmasi password baru" initialValue={confirmPw} variant="password" />

              {pwError && (
                <view className="rounded-xl bg-red-50 p-3">
                  <text className="text-xs text-red-500">{pwError}</text>
                </view>
              )}
              {pwSuccess && (
                <view className="rounded-xl bg-green-50 p-3">
                  <text className="text-xs font-bold text-green-600">
                    Berhasil mengubah password
                  </text>
                </view>
              )}

              <Button
                className="h-12 w-full rounded-2xl bg-primary"
                disabled={isSavingPw || !currentPw || newPw !== confirmPw}
                onPress={() => {
                  setPwError(null);
                  updatePassword({
                    current_password: currentPw,
                    new_password: newPw,
                    new_password_confirmation: confirmPw,
                  });
                }}
                isLoading={isSavingPw}
              >
                Simpan
              </Button>
            </Section>

            <Section title="Ubah email Anda">
              {!emailSent ? (
                <>
                  <Text size={TextType.b3} className="text-subtle">
                    Email saat ini: {profile.email ?? '—'}
                  </Text>
                  <Input title="Email baru" initialValue={newEmail} variant="email" />
                  <Button
                    className="h-12 w-full rounded-2xl bg-primary"
                    disabled={isSendingEmail || !newEmail}
                    onPress={() => changeEmail({ new_email: newEmail })}
                    isLoading={isSendingEmail}
                  >
                    Kirim verifikasi
                  </Button>
                </>
              ) : (
                <>
                  <view className="rounded-xl bg-accent p-3">
                    <text className="text-xs text-primary">
                      Email verifikasi telah dikirim ke email {newEmail}.
                    </text>
                  </view>
                  <Input title="Verification token" initialValue={emailToken} />
                  <Button
                    className="h-12 w-full rounded-2xl bg-primary"
                    disabled={isVerifyingEmail || !emailToken || !emailUuid}
                    onPress={() => verifyEmail({ uuid: emailUuid!, token: emailToken })}
                    isLoading={isVerifyingEmail}
                  >
                    Verifikasi email
                  </Button>
                  <view bindtap={() => setEmailSent(false)} className="items-center">
                    <text className="text-xs text-subtle">← Gunakan email lainnya</text>
                  </view>
                </>
              )}
            </Section>
            <view className="h-10" />
          </scroll-view>
        </view>
      </SlideScreen>

      {/* ════ PRIVACY SCREEN ════ */}
      <SlideScreen active={activeScreen === 'privacy'}>
        <view className="flex-1 flex-col bg-canvas flex" style={{ flex: 1 }}>
          <BackHeader title="Privacy" onBack={() => setActiveScreen('menu')} />
          <scroll-view className="flex-1 p-4" scroll-y>
            <Section title="Visibilitas profil Anda">
              {(['public', 'private', 'friends_only'] as ProfileVisibility[]).map((v) => (
                <view
                  key={v}
                  bindtap={() => setPrivacyForm((p) => ({ ...p, profile_visibility: v }))}
                  className={`flex-row items-center gap-3 rounded-xl border-2 p-4 flex ${
                    privacyForm.profile_visibility === v
                      ? 'border-primary bg-accent'
                      : 'border-light bg-surface'
                  }`}
                >
                  <text>{v === 'public' ? '🌍' : v === 'private' ? '🔒' : '👥'}</text>
                  <Text
                    size={TextType.b2}
                    fontWeight={privacyForm.profile_visibility === v ? 'bold' : 'normal'}
                    className={
                      privacyForm.profile_visibility === v ? 'text-primary' : 'text-muted'
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
              className="h-14 w-full rounded-2xl bg-primary"
              disabled={isSavingPrivacy}
              onPress={() => updatePrivacy(privacyForm)}
              isLoading={isSavingPrivacy}
            >
              Simpan
            </Button>
            <view className="h-10" />
          </scroll-view>
        </view>
      </SlideScreen>

      {/* ════ DANGER ZONE SCREEN ════ */}
      <SlideScreen active={activeScreen === 'danger'}>
        <view className="flex-1 flex-col bg-canvas flex" style={{ flex: 1 }}>
          <BackHeader title="Account" onBack={() => setActiveScreen('menu')} />
          <scroll-view className="flex-1 p-4" scroll-y>
            <Section title="Session">
              <Button onPress={logout}>Logout</Button>
            </Section>

            <Section title="Delete account">
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
                    <text className="text-xs text-subtle">Batalkan</text>
                  </view>
                </>
              )}
            </Section>

            <view className="h-10" />
          </scroll-view>
        </view>
      </SlideScreen>
    </view>
  );
};

export default ProfilePage;
