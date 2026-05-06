import type { ApiResponse } from '@/lib/api/core';

export type UserStatus = 'pending' | 'active' | 'inactive' | 'banned';
export type ProfileVisibility = 'public' | 'private' | 'friends_only';

export interface StudentStatistics {
  total_courses: number;
  completed_courses: number;
  total_xp: number;
  current_level: number;
}

export interface ProfileResource {
  id: number;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  status: UserStatus;
  role: string;
  roles: string[];
  created_at: string;
  updated_at: string;
  email?: string;
  phone?: string;
  email_verified_at?: string;
  last_profile_update?: string;
  statistics?: StudentStatistics;
}

export interface ProfilePrivacyResource {
  profile_visibility: ProfileVisibility;
  show_email: boolean;
  show_phone: boolean;
  show_activity_history: boolean;
  show_achievements: boolean;
  show_statistics: boolean;
  updated_at?: string;
}

export interface AvatarUploadResource {
  avatar_url: string;
}

export interface EmailChangeRequestResource {
  uuid: string;
}

export interface AccountDeletionRequestResource {
  uuid: string;
}

// Payloads
export interface UpdateProfilePayload {
  name: string;
  phone?: string;
  bio?: string;
  location?: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UpdatePrivacyPayload {
  profile_visibility: ProfileVisibility;
  show_email: boolean;
  show_phone: boolean;
  show_activity_history: boolean;
  show_achievements: boolean;
  show_statistics: boolean;
}

export interface ChangeEmailPayload {
  new_email: string;
}

export interface VerifyEmailChangePayload {
  uuid: string;
  token: string;
}

export interface DeleteAccountPayload {
  password: string;
}

export interface RestoreAccountPayload {
  uuid: string;
  token: string;
}

// API response wrappers
export type GetProfileResponse = ApiResponse<ProfileResource>;
export type UpdateProfileResponse = ApiResponse<ProfileResource>;
export type AvatarUploadResponse = ApiResponse<AvatarUploadResource>;
export type GetPrivacyResponse = ApiResponse<ProfilePrivacyResource>;
export type UpdatePrivacyResponse = ApiResponse<ProfilePrivacyResource>;
export type EmailChangeResponse = ApiResponse<EmailChangeRequestResource>;
export type DeleteAccountResponse = ApiResponse<AccountDeletionRequestResource>;
export type EmptyApiResponse = ApiResponse<null>;
