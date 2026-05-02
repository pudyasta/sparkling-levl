import type { Token } from '@/types/auth';

export function isTokenValid(token: Token | null | undefined): boolean {
  if (!token?.access_token) return false;
  if (!token.expires_in) return false;
  return token.expires_in > Math.floor(Date.now() / 1000);
}
