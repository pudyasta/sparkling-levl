// usecase/useSubmitFinalAssignment.ts
import { useMutation } from '@tanstack/react-query';

import { callToast } from '@/lib/helper/showToast';

import type { SubmitFinalAssignmentRequest } from '../repository/type/assignment';
import { useSubmitFinalAssignmentRepo } from '../repository/useSumbitFinalAssignmentRepo';

interface UseSubmitFinalAssignmentProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useSubmitFinalAssignment = (options?: UseSubmitFinalAssignmentProps) => {
  const { submitFinalAssignment } = useSubmitFinalAssignmentRepo();

  const mutation = useMutation({
    mutationFn: async (request: SubmitFinalAssignmentRequest) => {
      return submitFinalAssignment(request);
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
      callToast('Tugas berhasil dikumpulkan', 'success');
    },
    onError: (error: any) => {
      options?.onError?.(error);
      callToast('Gagal mengumpulkan tugas, coba lagi ya!', 'error');
    },
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
