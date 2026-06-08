import { useEffect, useRef, useState } from '@lynx-js/react';

import type { InputRef } from '@/components/Input/Input';
import Input from '@/components/Input/Input';
import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
import { pickAnyFile } from '@/lib/helper/filePicker';
import { callToast } from '@/lib/helper/showToast';

import type { AssignmentStudentResponse } from '../../repository/type/assignment';
import { useSubmitAssignment } from '../../usecase/useSubmitAssignment';
import { useSubmitFinalAssignment } from '../../usecase/useSubmitFinalAssignment';

export interface MediaFile {
  name: string;
  size: number;
  tempFilePath: string;
  mimeType: string;
}
function parseToJson(str: string) {
  const inner = str.replace(/[{}]/g, '').trim();

  const obj: Record<string, string> = {};
  inner.split(',').forEach((pair) => {
    const [key, ...rest] = pair.trim().split('=');
    obj[key.trim()] = rest.join('=').trim();
  });

  return obj;
}

const AssignmentContent = ({
  data,
  onDataChanged,
}: {
  data: AssignmentStudentResponse;
  onDataChanged: () => void;
}) => {
  const answerRef = useRef<InputRef>(null);
  const [fileError, setFileError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [answerInitialValue, setAnswerInitialValue] = useState('');

  const [isFileEdited, setIsFileEdited] = useState(false);
  const [isAnswerEdited, setIsAnswerEdited] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const isGraded = data.submission_status === 'graded';
  const { execute: submitAssignment, isLoading: isSubmitDraft } = useSubmitAssignment({
    onSuccess: () => onDataChanged(),
  });

  const { execute: submitFinalAssignment, isLoading: isSubmittingFinal } = useSubmitFinalAssignment(
    {
      onSuccess: () => {
        setIsSubmitModalOpen(false);
        onDataChanged();
      },
      onError: () => setIsSubmitModalOpen(false),
    }
  );

  const choose = () => {
    if (['submitted', 'graded'].includes(data?.submission_status || '')) {
      return;
    }
    pickAnyFile('all', (res) => {
      if (res.data?.tempFiles?.length > 0) {
        const mappedFile = res.data.tempFiles.map((m: any) => ({
          ...parseToJson(m),
          mimeType: parseToJson(m).name.split('.')[parseToJson(m).name.split('.').length - 1],
        }));
        setSelectedFiles(mappedFile);
        setIsFileEdited(true);
      }
    });
  };

  const validateAndSubmitDraft = () => {
    setFileError('');
    answerRef.current?.setError('');
    if (data.submission_type !== 'file' && !answerRef.current?.getValue()) {
      answerRef.current?.setError('Kolom tautan jawaban harus diisi');
      return;
    }

    if (data.submission_type !== 'text' && selectedFiles.length === 0) {
      setFileError('Kolom file harus diisi');
      return;
    }

    if (!data.submission_type) {
      return;
    }

    submitAssignment({
      assignmentID:
        data.submission_status !== 'draft'
          ? data.id
          : data.submissions[data.submissions.length - 1].id,
      files: isFileEdited ? selectedFiles : [],
      answerText: isAnswerEdited ? answerRef.current?.getValue() : answerInitialValue,
      type: data.submission_type,
      method: data.submission_status === 'draft' ? 'PUT' : 'POST',
    });
  };

  const handleConfirmFinalSubmit = () => {
    const submissionId = data.submissions[data.submissions.length - 1]?.id;
    if (!submissionId) {
      callToast('Submission tidak ditemukan', 'error');
      return;
    }
    submitFinalAssignment({ submission_id: submissionId });
  };

  useEffect(() => {
    if (data.submissions.length > 0) {
      if (data.submissions[data.submissions.length - 1]?.answer_text) {
        setIsAnswerEdited(false);
        setAnswerInitialValue(data.submissions[data.submissions.length - 1]?.answer_text || '');
      }
      if (data.submissions[data.submissions.length - 1]?.files?.length > 0) {
        setIsFileEdited(false);
        setSelectedFiles(
          data.submissions[data.submissions.length - 1].files?.map((f) => ({
            name: f.file_name,
            size: f.size,
            tempFilePath: f.file_url,
            mimeType: f.mime_type,
          }))
        );
      }
    }
  }, [data]);

  return (
    data && (
      <view className="mt-5 flex-col px-5 pb-[40px] pt-[60px] flex">
        {/* 1. Header & Title */}
        <view className="mb-6">
          <view className="mb-2 flex-row items-center flex">
            <view className="mr-2 rounded-md bg-orange-100 px-2 py-1">
              <text className="uppercase text-[10px] font-bold text-orange-600">Tugas</text>
            </view>
            <Text size={TextType.b2} color={Colors.Primary}>
              Materi Ke-{data.order}
            </Text>
          </view>
          <Text size={TextType.h2} fontWeight={'bold'} className="leading-tight">
            {data.title}
          </Text>
        </view>

        {/* 2. Status Score Card */}
        <view
          className={`mb-6 flex-row items-center rounded-2xl p-4 flex justify-between ${isGraded ? 'border border-green-100 bg-green-50' : 'border border-blue-100 bg-blue-50'}`}
        >
          <view className="flex-col flex">
            <Text
              size={TextType.b2}
              fontWeight={'bold'}
              className={isGraded ? 'text-green-700' : 'text-blue-700'}
            >
              Status: {data.submission_status_label}
            </Text>
            {data.submitted_at && (
              <Text size={TextType.b2} className={isGraded ? 'text-green-600' : 'text-blue-600'}>
                Dikumpulkan pada {new Date(data.submitted_at).toLocaleDateString()}
              </Text>
            )}
          </view>
          <view className="items-end">
            <Text
              size={TextType.b2}
              fontWeight={'bold'}
              className={isGraded ? 'text-green-700' : 'text-blue-700'}
            >
              {data.score || '-'}
            </Text>
            <Text size={TextType.b2} className={isGraded ? 'text-green-600' : 'text-blue-600'}>
              Skor Akhir
            </Text>
          </view>
        </view>

        {/* 3. Instructions */}
        <view className="mb-6">
          <Text size={TextType.b2} color={Colors.Primary} className="mb-1 font-bold">
            Petunjuk:
          </Text>
          <Text size={TextType.b1} className="leading-relaxed">
            {data.instructions}
          </Text>
        </view>

        {/* 4. Submission Requirements Grid */}
        {(data.accepted_formats || data.max_file_size) && (
          <view className="mb-6 flex-row gap-3 flex">
            {data.accepted_formats && (
              <view className="flex-1 flex-col rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-3 flex">
                <Text size={TextType.b2} color={Colors.Primary}>
                  Format File
                </Text>
                <Text size={TextType.b2} fontWeight={'bold'} className="mt-1">
                  {data.accepted_formats?.map((f) => f.split('.')[1].toUpperCase()).join(', ')}
                </Text>
              </view>
            )}
            {data.max_file_size && (
              <view className="flex-1 flex-col rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-3 flex">
                <Text size={TextType.b2} color={Colors.Primary}>
                  Ukuran Maksimal
                </Text>
                <Text size={TextType.b2} fontWeight={'bold'} className="mt-1">
                  {data.max_file_size} MB
                </Text>
              </view>
            )}
          </view>
        )}

        {/* 5. Upload Area */}
        {!data.is_completed && (
          <>
            {(data.submission_type == 'text' || data.submission_type == 'mixed') && (
              <Input
                title="Tautan ke berkas"
                variant="text"
                icon="mail"
                ref={answerRef}
                initialValue={answerInitialValue}
                disabled={['submitted', 'graded'].includes(data?.submission_status || '')}
                bindChange={(value: any) => {
                  setIsAnswerEdited(value !== answerInitialValue);
                }}
              />
            )}
            {(data.submission_type == 'file' || data.submission_type == 'mixed') && (
              <view className="mt-5 flex-col flex">
                <Text size={TextType.b2} className="mb-2 font-bold">
                  Unggah Jawaban:
                </Text>
                <view
                  className={`items-center rounded-2xl border-2 border-dashed border-[#dadce0] bg-[#f8f9fa] p-6 justify-center ${fileError ? 'border-red-500' : ''}`}
                  bindtap={choose}
                >
                  {selectedFiles.length > 0 ? (
                    <view className="w-full">
                      {selectedFiles.map((file: MediaFile) => (
                        <view
                          key={file.tempFilePath}
                          className="mt-2 flex-row items-center rounded-xl border border-[#e8eaed] bg-white p-3 flex shadow-sm"
                        >
                          <view className="mr-3 h-8 min-w-8 items-center rounded-lg bg-blue-50 justify-center">
                            <text className="text-xs font-bold text-blue-600">
                              {file.mimeType.split('.')[file.mimeType.split('.').length - 1]}
                            </text>
                          </view>
                          <Text size={TextType.b2}>{file.name}</Text>
                        </view>
                      ))}
                    </view>
                  ) : (
                    <view className="items-center">
                      <view className="mb-3 h-12 w-12 items-center rounded-full bg-blue-100 justify-center">
                        <text className="text-xl font-bold text-blue-600">+</text>
                      </view>
                      <Text size={TextType.b1} fontWeight={'bold'} className="text-blue-600">
                        Pilih File Tugas
                      </Text>
                    </view>
                  )}
                </view>
                {fileError && <Text color={Colors.Error} className="mt-1">{`${fileError}`}</Text>}
              </view>
            )}
          </>
        )}
        <view className="mt-8">
          <Button
            disabled={data.submission_status == 'submitted' || data.submission_status == 'graded'}
            onPress={validateAndSubmitDraft}
            className="h-14 w-full"
            variant="outlined"
            isLoading={isSubmitDraft}
          >
            Simpan sebagai Draft
          </Button>
          <Button
            disabled={data.submission_status != 'draft' || isFileEdited || isAnswerEdited}
            onPress={() => setIsSubmitModalOpen(true)}
            className="mt-2 h-14 w-full"
          >
            Kumpulkan Tugas
          </Button>
        </view>
        <Modal
          template={ModalTemplate.Custom}
          visible={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
        >
          <view className="flex-col gap-4 flex">
            <Text size={TextType.h2} fontWeight="600" className="text-center">
              Kumpulkan tugas?
            </Text>
            <Text className="text-[#5f6368] text-center">
              Setelah dikumpulkan, kamu tidak bisa mengubah jawaban lagi. Pastikan semua sudah benar
              ya.
            </Text>
            <view className="flex-col gap-3 flex">
              <Button
                size="small"
                variant="filled"
                color="primary"
                onPress={handleConfirmFinalSubmit}
                isLoading={isSubmittingFinal}
              >
                Kumpulkan sekarang
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onPress={() => setIsSubmitModalOpen(false)}
                className="mt-2"
              >
                Periksa lagi
              </Button>
            </view>
          </view>
        </Modal>
      </view>
    )
  );
};

export default AssignmentContent;
