import { useMutation } from '@tanstack/react-query';

import { useEnrollCourseRepo } from '../repository/useEnrollCourseRepo';
import type { CourseEnrollResponse, EnrollCoursePayload } from '../type/enrollment';

interface EnrollCourseVariables {
  courseSlug: string;
  payload?: EnrollCoursePayload;
}

interface UseEnrollCourseOptions {
  onSuccess?: (data: CourseEnrollResponse) => void;
  onError?: (error: any) => void;
  onValidationError?: (errors: any) => void;
}

export const useEnrollCourse = (options?: UseEnrollCourseOptions) => {
  const { enrollCourseApi } = useEnrollCourseRepo();

  const mutation = useMutation({
    mutationFn: async ({ courseSlug, payload }: EnrollCourseVariables) => {
      return enrollCourseApi(courseSlug, payload);
    },
    onSuccess: (data) => {
      if (!data.success && data.errors) {
        options?.onValidationError?.(data.errors);
        return;
      }
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.log('EnrollCourse error:', JSON.stringify(error, null, 2));
      options?.onError?.(error);
    },
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
