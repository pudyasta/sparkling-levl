import pipe from 'sparkling-method';

import type { MediaFile } from '@/pages/Lessons/components/Assignment';
import type { AssignmentSubmissionType } from '@/pages/Lessons/repository/type/assignment';
import type { NativeSubmitFileParams } from '@/pages/Lessons/repository/useSumbitAssignmentRepo';

export const uploadFiles = (
  url: string,
  answerText?: string,
  files?: Array<{ uri: string; name: string; mimeType: string }> | null,
  headers?: Record<string, string>,
  callback?: (res: any) => void
) => {
  pipe.call(
    'FileUploader.uploadFile',
    {
      url,
      answerText,
      files,
      headers,
    },
    (res) => {
      callback?.(res);
    }
  );
};

interface SubmitParams {
  url: string;
  assignmentId: number;
  type: AssignmentSubmissionType;
  answerText?: string;
  files?: NativeSubmitFileParams[];
  headers?: Record<string, string>;
  method?: 'POST' | 'PUT';
  callback?: (res: any) => void;
}

// Text-only — no file picking needed
const submitText = (params: SubmitParams) => {
  if (!params.answerText?.trim()) {
    console.error('answerText is required for text submission');
    return;
  }

  pipe.call(
    'FileUploader.uploadFile',
    {
      url: params.url,
      answerText: params.answerText,
      files: [],
      headers: params.headers,
      method: params.method,
    },
    (res) => {
      params.callback?.(res);
    }
  );
};

// Files-only — pick files then upload with empty answerText
const submitFiles = (params: SubmitParams) => {
  if (!params.files?.length) return;

  pipe.call(
    'FileUploader.uploadFile',
    {
      url: params.url,
      answerText: '',
      files: params.files,
      headers: params.headers,
      method: params.method,
    },
    (res) => {
      params.callback?.(res);
    }
  );
};

// Mixed — both answerText and files required
const submitMixed = (params: SubmitParams) => {
  if (!params.answerText?.trim()) {
    return;
  }

  pipe.call(
    'FileUploader.uploadFile',
    {
      url: params.url,
      answerText: params.answerText,
      files: params.files,
      headers: params.headers,
      method: params.method,
    },
    (res) => {
      params.callback?.(res);
    }
  );
};

// Helper to map picker response to upload format
const mapPickerFiles = (pickerRes: any) => {
  const files =
    pickerRes?.tempFiles?.map((f: any) => ({
      uri: f.tempFilePath,
      name: f.name,
      mimeType: f.mimeType ?? '*/*',
    })) ?? [];

  if (!files.length) {
    console.error('No files picked');
  }

  return files;
};

// Main entry point
export const submitAssignmentNative = (params: SubmitParams) => {
  switch (params.type) {
    case 'text':
      return submitText(params);
    case 'file':
      return submitFiles(params);
    case 'mixed':
      return submitMixed(params);
  }
};
