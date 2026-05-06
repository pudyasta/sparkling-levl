import { useQuery } from '@tanstack/react-query';

import { useProfileRepo } from '../repository/userProfile';

export const useGetPrivacy = () => {
  const { getPrivacyApi } = useProfileRepo();

  const query = useQuery({
    queryKey: ['profile', 'privacy'],
    queryFn: async () => {
      const res = await getPrivacyApi();
      return res.data;
    },
  });

  return {
    privacy: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};
