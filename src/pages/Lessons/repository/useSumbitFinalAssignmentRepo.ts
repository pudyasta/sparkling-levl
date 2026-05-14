import { API_BASE_URL, POST_METHOD } from '@/constant/api';
import { SUBMIT_FINAL_ASSIGNMENT_ENDPOINT } from '@/constant/route';
import { useApiClient } from '@/lib/api/core';

import type { SubmitFinalAssignmentRequest } from './type/assignment';

export interface NativeSubmitFileParams {
  uri: string;
  name: string;
  mimeType: string;
}

export const useSubmitFinalAssignmentRepo = () => {
  const { api } = useApiClient();

  const submitFinalAssignment = (request: SubmitFinalAssignmentRequest) => {
    if (!request.submission_id) {
      return;
    }

    const url = SUBMIT_FINAL_ASSIGNMENT_ENDPOINT.replace(
      'SUBMISSION_ID',
      request.submission_id.toString()
    );

    const response = api(url, {
      method: POST_METHOD,
    });

    return response;
  };

  return { submitFinalAssignment };
};
