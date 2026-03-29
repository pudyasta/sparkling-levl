import type { Token } from '@/pages/Login/repository/type';

export const isTokenValid = (token: Token | undefined): boolean => {
  if (!token) return false;
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    return token.expires_in > currentTime;
  } catch (error) {
    return false;
  }
};
