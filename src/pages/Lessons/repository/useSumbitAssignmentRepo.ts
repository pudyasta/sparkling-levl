import { API_BASE_URL } from '@/constant/api';
import {
  SUBMIT_ASSIGNMENT_DETAIL_ENDPOINT,
  UPDATE_ASSIGNMENT_DETAIL_ENDPOINT,
} from '@/constant/route';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { submitAssignmentNative } from '@/lib/helper/uploadFile';

import type { MediaFile } from '../components/Assignment';
import type { SubmitAssignmentRequest } from '../usecase/useSubmitAssignment';

export interface NativeSubmitFileParams {
  uri: string;
  name: string;
  mimeType: string;
}

export const useSubmitAssignmentRepo = () => {
  const { accessToken } = useNativeBridge();

  const submitAssignment = (request: SubmitAssignmentRequest) => {
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
    console.log(request.method);

    const res = submitAssignmentNative({
      url,
      assignmentId: request.assignmentID,
      type: request.type,
      files: mappedFile,
      answerText: request.answerText,
      headers: { Authorization: `Bearer ${accessToken?.access_token}` },
      method: request.method,
      callback(res) {
        console.log('resss', JSON.stringify(res, null, 2));
      },
    });

    return res;
  };

  return { submitAssignment };
};
