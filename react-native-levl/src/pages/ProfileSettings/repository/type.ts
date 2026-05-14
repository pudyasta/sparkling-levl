export type UserStatus = 'pending' | 'active' | 'inactive' | 'banned';
export type ProfileVisibility = 'public' | 'private' | 'friends_only';

export interface ProfileResource {
  id: number;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  status: UserStatus;
  role: string;
  email?: string;
  phone?: string;
  email_verified_at?: string;
}

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
