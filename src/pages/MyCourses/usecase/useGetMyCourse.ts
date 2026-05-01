import { useQuery } from '@tanstack/react-query';

import type { ApiResponse } from '@/lib/api/core';

import { useGetMyCourseRepo } from '../repository/useGetMyCourse';
import type { MyCourse, MyCourseResponse } from '../type/MyCourse';

interface QueryOptions<T> {
  request: {
    search?: string;
  };
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export const useGetMyCourse = <TData = MyCourse[]>(
  options?: Omit<QueryOptions<ApiResponse<TData>>, 'queryKey' | 'queryFn'>
) => {
  const { getMyCourseApi } = useGetMyCourseRepo();

  return useQuery({
    queryKey: ['myCourse'],
    queryFn: async (): Promise<ApiResponse<TData>> => {
      let response = await getMyCourseApi({ search: options?.request?.search });

      return response.data as ApiResponse<TData>;
    },
    ...options,
  });
};
