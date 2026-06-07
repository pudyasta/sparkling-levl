import { useMutation } from '@tanstack/react-query';

import { callToast } from '@/lib/helper/showToast';

import type { MediaFile } from '../components/Assignment';
import type { AssignmentSubmissionType } from '../repository/type/assignment';
import { useSubmitAssignmentRepo } from '../repository/useSumbitAssignmentRepo';

interface UseSubmitAssigmentProps {
  onValidationError?: (errors: any) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface SubmitAssignmentRequest {
  assignmentID?: number;
  type: AssignmentSubmissionType;
  answerText?: string;
  files: MediaFile[];
  method: 'POST' | 'PUT';
}

export const useSubmitAssignment = (options?: UseSubmitAssigmentProps) => {
  const { submitAssignment } = useSubmitAssignmentRepo();

  const mutation = useMutation({
    mutationFn: async (request: SubmitAssignmentRequest) => {
      return submitAssignment(request);
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      callToast('Tugas gagal disimpan sebagai draft, coba lagi ya!', 'error');
    },
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
