import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

interface BackInterceptorProps {
  onBackPressed?: () => void;
}

export const BackInterceptor: React.FC<BackInterceptorProps> = ({ onBackPressed }) => {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBackPressed?.();
      return true;
    });
    return () => sub.remove();
  }, [onBackPressed]);

  return null;
};

export function useBackInterceptor({ onBackPressed }: { onBackPressed: () => void }) {
  const confirmBack = useCallback(() => {
    router.back();
  }, []);

  return { confirmBack };
}
