import { useState } from '@lynx-js/react';

import { API_BASE_URL } from '@/constant/api';
import {
  SUBMIT_ASSIGNMENT_DETAIL_ENDPOINT,
  UPDATE_ASSIGNMENT_DETAIL_ENDPOINT,
} from '@/constant/route';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { callToast } from '@/lib/helper/showToast';
import { submitAssignmentNative } from '@/lib/helper/uploadFile';

import type { MediaFile } from '../components/Assignment';
import type { SubmitAssignmentRequest } from '../usecase/useSubmitAssignment';

export interface NativeSubmitFileParams {
  uri: string;
  name: string;
  mimeType: string;
}

function extractErrorMessage(error: any): string {
  try {
    // The msg field contains the actual HTTP response as a string
    const rawMsg = error?.msg || error?.message || '';

    // Extract the JSON part after "HTTP 422: "
    const jsonMatch = rawMsg.match(/HTTP \d+: (.+)/);
    if (!jsonMatch) return rawMsg;

    const parsed = JSON.parse(jsonMatch[1]);

    // 1. Try to get the first validation error
    if (parsed.errors) {
      const firstField = Object.keys(parsed.errors)[0];
      const firstError = parsed.errors[firstField]?.[0];
      if (firstError) return firstError;
    }

    // 2. Fall back to the main message
    return parsed.message || 'Terjadi kesalahan';
  } catch {
    return 'Terjadi kesalahan';
  }
}

export const useSubmitAssignmentRepo = () => {
  const { accessToken } = useNativeBridge();
  const [isLoading, setIsLoading] = useState(false);

  const submitAssignment = (request: SubmitAssignmentRequest) => {
    setIsLoading(true);
    if (!request.assignmentID) {
      return;
    }

    const url =
      API_BASE_URL +
      (request.method === 'PUT'
        ? UPDATE_ASSIGNMENT_DETAIL_ENDPOINT.replace(
            'ASSIGNMENT_ID',
            request.assignmentID.toString()
          )
        : SUBMIT_ASSIGNMENT_DETAIL_ENDPOINT.replace(
            'ASSIGNMENT_ID',
            request.assignmentID.toString()
          ));

    const mappedFile = request.files.map((m: MediaFile): NativeSubmitFileParams => {
      return {
        uri: m.tempFilePath,
        name: m.name,
        mimeType: m.mimeType,
      };
    });

    const res = submitAssignmentNative({
      url,
      assignmentId: request.assignmentID,
      type: request.type,
      files: mappedFile,
      answerText: request.answerText,
      headers: { Authorization: `Bearer ${accessToken?.access_token}` },
      method: request.method,
      callback(res) {
        setIsLoading(false);
        if (res.code == 1) {
          callToast('Tugas berhasil disimpan sebagai draft.', 'success');
          return;
        }
        const msg = extractErrorMessage(res);
        callToast(msg, 'error');
      },
    });

    return res;
  };

  return { submitAssignment, isLoading };
};
