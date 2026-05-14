import { useQuery } from '@tanstack/react-query';
import { useProfileRepository } from '@/repository/profile/useProfileRepository';

export const useGetProfile = () => {
  const { getProfileApi } = useProfileRepository();
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: getProfileApi,
  });
  return { ...query, profile: (query.data?.data ?? null) as any };
};
