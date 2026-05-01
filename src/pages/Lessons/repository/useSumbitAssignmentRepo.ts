import { API_BASE_URL, POST_METHOD } from '@/constant/api';
import { SUBMIT_ASSIGNMENT_DETAIL_ENDPOINT } from '@/constant/route';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { useApiClient } from '@/lib/api/core';
import { submitAssignmentNative, uploadFiles } from '@/lib/helper/uploadFile';

import type { SubmitAssignmentRequest } from '../usecase/useSubmitAssignment';

export const useSubmitAssignmentRepo = () => {
  const { accessToken } = useNativeBridge();

  const submitAssignment = (request: SubmitAssignmentRequest) => {
    if (!request.assignmentID) {
      console.log('assignmentID null');
      return;
    }
    const url =
      API_BASE_URL +
      SUBMIT_ASSIGNMENT_DETAIL_ENDPOINT.replace('ASSIGNMENT_ID', request.assignmentID.toString());

    return submitAssignmentNative({
      url,
      assignmentId: request.assignmentID,
      type: request.type,
      files: request.files,
      answerText: request.answerText,
      headers: { Authorization: `Bearer ${accessToken?.access_token}` },
      callback(res) {
        console.log('resss', JSON.stringify(res, null, 2));
      },
    });
  };

  return { submitAssignment };
};
