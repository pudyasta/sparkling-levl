import { useQuery } from '@tanstack/react-query';

import type { ProfileResource } from '../repository/type';
import { useProfileRepo } from '../repository/userProfile';

export const useGetProfile = () => {
  const { getProfileApi } = useProfileRepo();

  const query = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<ProfileResource> => {
      const res = await getProfileApi();
      return res.data;
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    error: query.error,
  };
};
