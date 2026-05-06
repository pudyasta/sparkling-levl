import { useState } from '@lynx-js/react';

import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
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

type Tab = 'profile' | 'security' | 'privacy' | 'danger';

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

// ─── Form field ───────────────────────────────────────────────────────────────
const Field = ({
  label,
  value,
  placeholder,
  onChange,
  secureText,
  keyboardType,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  secureText?: boolean;
  keyboardType?: string;
}) => (
  <view className="flex-col gap-1 flex">
    <Text size={TextType.b3} className="text-slate-400">
      {label}
    </Text>
    <view className="rounded-xl border border-slate-200 bg-slate-50 px-4" style={{ height: 48 }}>
      <input
        className="flex-1 text-sm text-slate-800"
        placeholder={placeholder ?? label}
        bindinput={(e: any) => onChange(e.detail.value)}
      />
    </view>
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
      className={`h-6 w-12 rounded-full justify-center ${value ? 'bg-blue-500' : 'bg-slate-200'}`}
      style={{ alignItems: value ? 'flex-end' : 'flex-start', padding: '2px' }}
    >
      <view className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </view>
  </view>
);

export const dummyProfile: ProfileResource = {
  id: 4,
  name: 'Student Test',
  username: 'studenttest',
  bio: 'Saya seorang student yang sedang belajar programming.',
  location: 'Bandung, Indonesia',
  avatar_url: 'https://i.pravatar.cc/150?img=12',
  status: 'active',
  role: 'Student',
  roles: ['Student'],
  email: 'student@test.com',
  phone: '081234567890',
  email_verified_at: '2025-01-01T00:00:00Z',
  last_profile_update: '2026-04-01T08:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2026-04-01T08:00:00Z',
  statistics: {
    total_courses: 12,
    completed_courses: 5,
    total_xp: 3400,
    current_level: 7,
  },
};
// ─── Main page ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { logout, navigateTo } = useNativeBridge();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // ── Profile data ──
  const profile = dummyProfile;
  const isLoading = false;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // Sync form when profile loads
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

  // Sync when loaded
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

  // ─── Avatar picker (via native module) ───────────────────────────────────
  const handlePickAvatar = () => {
    pickAnyFile('image', (res) => {
      const file = res?.tempFiles?.[0];
      if (!file) return;
      // pipe.call to FileUploader.uploadFile pointing to /api/v1/profile/avatar
      // using name="avatar" field per the API spec
    });
  };

  if (isLoading || !profile) {
    return (
      <view className="flex-1 items-center bg-slate-50 justify-center">
        <text className="mb-3 text-4xl">👤</text>
        <Text size={TextType.b1} className="text-slate-400">
          Loading profile...
        </Text>
      </view>
    );
  }

  const TABS: { key: Tab; label: string; emoji: string }[] = [
    { key: 'profile', label: 'Profile', emoji: '👤' },
    { key: 'security', label: 'Security', emoji: '🔐' },
    { key: 'privacy', label: 'Privacy', emoji: '👁️' },
    { key: 'danger', label: 'Account', emoji: '⚠️' },
  ];

  return (
    <view className="h-screen w-full flex-col bg-slate-50 flex">
      {/* ── Hero header ── */}
      <view className="bg-blue-600 px-5 pb-6 pt-12">
        <view className="flex-row items-center gap-4 flex">
          {/* Avatar */}
          <view className="relative">
            <view className="h-20 w-20 items-center rounded-full bg-blue-400 justify-center overflow-hidden">
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
              className="h-7 w-7 items-center rounded-full bg-white absolute -bottom-1 -right-1 justify-center shadow-md"
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
            <view className="mt-1 self-start rounded-full bg-blue-500 px-2 py-0.5">
              <text className="uppercase text-[10px] font-bold text-blue-100">{profile.role}</text>
            </view>
          </view>
        </view>

        {/* Stats row */}
        {profile.statistics && (
          <view className="mt-4 flex-row gap-3 flex">
            {[
              { label: 'Courses', value: profile.statistics.total_courses },
              { label: 'Completed', value: profile.statistics.completed_courses },
              { label: 'XP', value: profile.statistics.total_xp },
              { label: 'Level', value: profile.statistics.current_level },
            ].map((stat) => (
              <view key={stat.label} className="flex-1 items-center rounded-xl bg-blue-500/50 py-2">
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

      {/* ── Tab bar ── */}
      <view className="flex-row border-b border-slate-100 bg-white flex">
        {TABS.map((tab) => (
          <view
            key={tab.key}
            bindtap={() => setActiveTab(tab.key)}
            className={`flex-1 flex-col items-center gap-0.5 border-b-2 py-3 flex ${
              activeTab === tab.key ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <text className="text-base">{tab.emoji}</text>
            <text
              className={`text-[10px] font-bold ${
                activeTab === tab.key ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </text>
          </view>
        ))}
      </view>

      {/* ── Tab content ── */}
      <scroll-view className="flex-1 p-4" scroll-y>
        {/* ════ PROFILE TAB ════ */}
        {activeTab === 'profile' && (
          <view>
            <Section title="Basic info">
              <Field label="Full name" value={name} onChange={setName} />
              <Field label="Phone" value={phone} onChange={setPhone} keyboardType="phone" />
              <Field
                label="Location"
                value={location}
                onChange={setLocation}
                placeholder="e.g. Jakarta, Indonesia"
              />
              <Field
                label="Bio"
                value={bio}
                onChange={setBio}
                placeholder="Tell us about yourself"
              />

              {profileSaved && (
                <view className="rounded-xl bg-green-50 p-3">
                  <text className="text-xs font-bold text-green-600">✓ Profile updated!</text>
                </view>
              )}

              <Button
                className="h-12 w-full rounded-2xl bg-blue-600"
                disabled={isSavingProfile}
                onPress={() => updateProfile({ name, phone, bio, location })}
              >
                <text className="font-bold text-white">
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </text>
              </Button>
            </Section>

            {/* Avatar management */}
            {profile.avatar_url && (
              <Section title="Avatar">
                <Button
                  className="h-12 w-full rounded-2xl border-2 border-red-200"
                  //   onPress={() => deleteAvatar()}
                >
                  <text className="font-bold text-red-400">🗑️ Remove Avatar</text>
                </Button>
              </Section>
            )}
          </view>
        )}

        {/* ════ SECURITY TAB ════ */}
        {activeTab === 'security' && (
          <view>
            {/* Change password */}
            <Section title="Change password">
              <Field
                label="Current password"
                value={currentPw}
                onChange={setCurrentPw}
                secureText
              />
              <Field label="New password" value={newPw} onChange={setNewPw} secureText />
              <Field
                label="Confirm new password"
                value={confirmPw}
                onChange={setConfirmPw}
                secureText
              />

              {pwError && (
                <view className="rounded-xl bg-red-50 p-3">
                  <text className="text-xs text-red-500">{pwError}</text>
                </view>
              )}
              {pwSuccess && (
                <view className="rounded-xl bg-green-50 p-3">
                  <text className="text-xs font-bold text-green-600">✓ Password updated!</text>
                </view>
              )}

              <Button
                className="h-12 w-full rounded-2xl bg-blue-600"
                disabled={isSavingPw || !currentPw || newPw !== confirmPw}
                onPress={() => {
                  setPwError(null);
                  updatePassword({
                    current_password: currentPw,
                    new_password: newPw,
                    new_password_confirmation: confirmPw,
                  });
                }}
              >
                <text className="font-bold text-white">
                  {isSavingPw ? 'Updating...' : 'Update Password'}
                </text>
              </Button>
            </Section>

            {/* Change email */}
            <Section title="Change email">
              {!emailSent ? (
                <>
                  <Text size={TextType.b3} className="text-slate-400">
                    Current email: {profile.email ?? '—'}
                  </Text>
                  <Field
                    label="New email address"
                    value={newEmail}
                    onChange={setNewEmail}
                    keyboardType="email"
                  />
                  <Button
                    className="h-12 w-full rounded-2xl bg-blue-600"
                    disabled={isSendingEmail || !newEmail}
                    onPress={() => changeEmail({ new_email: newEmail })}
                  >
                    <text className="font-bold text-white">
                      {isSendingEmail ? 'Sending...' : 'Send Verification'}
                    </text>
                  </Button>
                </>
              ) : (
                <>
                  <view className="rounded-xl bg-blue-50 p-3">
                    <text className="text-xs text-blue-600">
                      Verification email sent to {newEmail}. Enter the token below.
                    </text>
                  </view>
                  <Field label="Verification token" value={emailToken} onChange={setEmailToken} />
                  <Button
                    className="h-12 w-full rounded-2xl bg-blue-600"
                    disabled={isVerifyingEmail || !emailToken || !emailUuid}
                    onPress={() => verifyEmail({ uuid: emailUuid!, token: emailToken })}
                  >
                    <text className="font-bold text-white">
                      {isVerifyingEmail ? 'Verifying...' : 'Verify Email'}
                    </text>
                  </Button>
                  <view bindtap={() => setEmailSent(false)} className="items-center">
                    <text className="text-xs text-slate-400">← Use a different email</text>
                  </view>
                </>
              )}
            </Section>
          </view>
        )}

        {/* ════ PRIVACY TAB ════ */}
        {activeTab === 'privacy' && (
          <view>
            <Section title="Profile visibility">
              {(['public', 'private', 'friends_only'] as ProfileVisibility[]).map((v) => (
                <view
                  key={v}
                  bindtap={() => setPrivacyForm((p) => ({ ...p, profile_visibility: v }))}
                  className={`flex-row items-center gap-3 rounded-xl border-2 p-4 flex ${
                    privacyForm.profile_visibility === v
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <text>{v === 'public' ? '🌍' : v === 'private' ? '🔒' : '👥'}</text>
                  <Text
                    size={TextType.b2}
                    fontWeight={privacyForm.profile_visibility === v ? 'bold' : 'normal'}
                    className={
                      privacyForm.profile_visibility === v ? 'text-blue-600' : 'text-slate-600'
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
                  { key: 'show_email', label: 'Show email', desc: 'Others can see your email' },
                  { key: 'show_phone', label: 'Show phone', desc: 'Others can see your phone' },
                  {
                    key: 'show_activity_history',
                    label: 'Show activity history',
                    desc: 'Display your learning activity',
                  },
                  {
                    key: 'show_achievements',
                    label: 'Show achievements',
                    desc: 'Display your badges and awards',
                  },
                  {
                    key: 'show_statistics',
                    label: 'Show statistics',
                    desc: 'Display your course statistics',
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
                <text className="text-xs font-bold text-green-600">✓ Privacy settings saved!</text>
              </view>
            )}

            <Button
              className="h-14 w-full rounded-2xl bg-blue-600"
              disabled={isSavingPrivacy}
              onPress={() => updatePrivacy(privacyForm)}
            >
              <text className="font-bold text-white">
                {isSavingPrivacy ? 'Saving...' : 'Save Privacy Settings'}
              </text>
            </Button>
          </view>
        )}

        {/* ════ DANGER ZONE TAB ════ */}
        {activeTab === 'danger' && (
          <view>
            {/* Sign out */}
            <Section title="Session">
              <Button
                className="h-12 w-full rounded-2xl border-2 border-slate-200"
                onPress={logout}
              >
                <text className="font-bold text-slate-600">🚪 Sign Out</text>
              </Button>
            </Section>

            {/* Delete account */}
            <Section title="Delete account">
              <view className="rounded-xl bg-red-50 p-4">
                <Text size={TextType.b3} className="text-red-500">
                  Deleting your account is permanent and cannot be undone. All your data will be
                  removed.
                </Text>
              </view>

              {deleteStep === 'idle' ? (
                <>
                  <Field
                    label="Enter your password to confirm"
                    value={deletePw}
                    onChange={setDeletePw}
                    secureText
                  />
                  <Button
                    className="h-12 w-full rounded-2xl bg-red-500"
                    disabled={isRequestingDelete || !deletePw}
                    onPress={() => requestDelete({ password: deletePw })}
                  >
                    <text className="font-bold text-white">
                      {isRequestingDelete ? 'Processing...' : '🗑️ Request Account Deletion'}
                    </text>
                  </Button>
                </>
              ) : (
                <>
                  <view className="rounded-xl bg-amber-50 p-3">
                    <text className="text-xs text-amber-600">
                      A confirmation token has been sent. Enter it below to permanently delete your
                      account.
                    </text>
                  </view>
                  <Field label="Confirmation token" value={deleteToken} onChange={setDeleteToken} />
                  <Button
                    className="h-12 w-full rounded-2xl bg-red-600"
                    disabled={isConfirmingDelete || !deleteToken || !deleteUuid}
                    onPress={() => confirmDelete({ uuid: deleteUuid!, token: deleteToken })}
                  >
                    <text className="font-bold text-white">
                      {isConfirmingDelete ? 'Deleting...' : '⚠️ Confirm Delete Account'}
                    </text>
                  </Button>
                  <view bindtap={() => setDeleteStep('idle')} className="items-center py-2">
                    <text className="text-xs text-slate-400">← Cancel</text>
                  </view>
                </>
              )}
            </Section>

            <view className="h-10" />
          </view>
        )}

        <view className="h-10" />
      </scroll-view>
    </view>
  );
};

export default ProfilePage;
