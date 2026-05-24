import { useState } from 'react';

import { useResendVerificationEmailRepo } from '../repository/useResendVerificationEmailRepo';

export const useResendVerificationEmail = () => {
  const { resendVerificationEmailApi } = useResendVerificationEmailRepo();
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (onSuccess?: () => void) => {
    setIsLoading(true);
    try {
      await resendVerificationEmailApi();
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
};
