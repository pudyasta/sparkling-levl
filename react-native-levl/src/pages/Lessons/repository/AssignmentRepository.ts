import { API_BASE_URL, GET_METHOD, POST_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import type { AssignmentStudentResponse, PickedFile } from './type/assignment';

export const useAssignmentRepository = () => {
  const { api } = useApiClient();
  const { accessToken } = useNativeBridge();

  const getAssignmentApi = (assignmentId: number) =>
    api(`/assignments/${assignmentId}`, { method: GET_METHOD }).then(
      (r: any) => r?.data as { success: boolean; data: AssignmentStudentResponse }
    );

  const submitDraftApi = async (
    assignmentId: number,
    submissionId: number | null,
    payload: { answerText: string; file: PickedFile | null; submissionType: string }
  ) => {
    const url = submissionId
      ? `${API_BASE_URL}/submissions/${submissionId}`
      : `${API_BASE_URL}/assignments/${assignmentId}/submissions`;
    const method = submissionId ? 'PUT' : 'POST';

    const formData = new FormData();
    formData.append('type', payload.submissionType);
    if (payload.answerText) formData.append('answer_text', payload.answerText);
    if (payload.file) {
      formData.append('files[]', {
        uri: payload.file.uri,
        name: payload.file.name,
        type: payload.file.mimeType || 'application/octet-stream',
      } as any);
    }

    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${accessToken?.access_token}` },
      body: formData,
    });
    return response.json();
  };

  const submitFinalApi = (submissionId: number) =>
    api(`/submissions/${submissionId}/submit`, { method: POST_METHOD }).then(
      (r: any) => r?.data
    );

  return { getAssignmentApi, submitDraftApi, submitFinalApi };
};
