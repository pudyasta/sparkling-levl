import type { Token } from '@/pages/Login/repository/type';

export const isTokenValid = (token: Token | null): boolean => {
  if (!token) return false;
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    console.log('Validation', currentTime, token.expires_in, token.expires_in > currentTime);
    return token.expires_in > currentTime;
  } catch (error) {
    return false;
  }
};
