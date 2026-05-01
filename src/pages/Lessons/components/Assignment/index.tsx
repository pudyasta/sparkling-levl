import { useEffect, useRef, useState } from 'react';

import type { InputRef } from '@/components/Input/Input';
import Input from '@/components/Input/Input';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
import { pickAnyFile } from '@/lib/helper/filePicker';

import type { AssignmentStudentResponse } from '../../repository/type/assignment';
import type { SubmitAssignmentRequest } from '../../usecase/useSubmitAssignment';

export interface MediaFile {
  name: string;
  size: number;
  tempFilePath: string;
  mimeType: string;
}

const AssignmentContent = ({
  data,
  onSubmit,
}: {
  data: AssignmentStudentResponse;
  onSubmit: (reques: SubmitAssignmentRequest) => void;
}) => {
  const answerRef = useRef<InputRef>(null);
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);

  const isGraded = data.submission_status === 'graded';
  const choose = () => {
    pickAnyFile('all', (res) => {
      const mappedFile = res.data.tempFiles.map((m: any) => {
        return {
          ...m,
          mimeType: m.name.split('.')[1],
        };
      });
      setSelectedFiles(mappedFile);
    });
  };

  return (
    data && (
      <view className="flex-col pb-[40px] pt-[60px] flex">
        {/* 1. Header & Title */}
        <view className="mb-6">
          <view className="mb-2 flex-row items-center flex">
            <view className="mr-2 rounded-md bg-orange-100 px-2 py-1">
              <text className="uppercase text-[10px] font-bold text-orange-600">Tugas</text>
            </view>
            <Text size={TextType.b2} color={Colors.Primary}>
              Step {data.order}
            </Text>
          </view>
          <Text size={TextType.h2} fontWeight={'bold'} className="leading-tight">
            {data.title}
          </Text>
        </view>

        {/* 2. Status Score Card (Only shows if submitted/graded) */}
        {
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
              <Text size={TextType.b2} className={isGraded ? 'text-green-600' : 'text-blue-600'}>
                Dikumpulkan pada{' '}
                {new Date(data.submitted_at ? data.submitted_at : '-').toLocaleDateString()}
              </Text>
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
        }

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
        <view className="mb-6 flex-row gap-3 flex">
          <view className="flex-1 flex-col rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-3 flex">
            <Text size={TextType.b2} color={Colors.Primary}>
              Format File
            </Text>
            <Text size={TextType.b2} fontWeight={'bold'} className="mt-1">
              PDF, DOC, ZIP, JPG
            </Text>
          </view>
          <view className="flex-1 flex-col rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-3 flex">
            <Text size={TextType.b2} color={Colors.Primary}>
              Ukuran Maksimal
            </Text>
            <Text size={TextType.b2} fontWeight={'bold'} className="mt-1">
              {data.max_file_size} MB
            </Text>
          </view>
        </view>

        {/* 5. Upload Area */}
        {!data.is_completed && (
          <>
            {(data.submission_type == 'text' || data.submission_type == 'mixed') && (
              <Input title="Tautan ke berkas" variant="text" icon="mail" ref={answerRef} />
            )}
            {(data.submission_type == 'file' || data.submission_type == 'mixed') && (
              <view className="mt-5 flex-col flex">
                <Text size={TextType.b2} className="mb-2 font-bold">
                  Unggah Jawaban:
                </Text>
                <view
                  className="items-center rounded-2xl border-2 border-dashed border-[#dadce0] bg-[#f8f9fa] p-6 justify-center"
                  bindtap={choose}
                >
                  {selectedFiles.length > 0 ? (
                    <view className="w-full">
                      {selectedFiles.map((file: MediaFile) => (
                        <view
                          key={file.tempFilePath}
                          className="mt-2 flex-row items-center rounded-xl border border-[#e8eaed] bg-white p-3 flex shadow-sm"
                        >
                          <view className="mr-3 h-8 w-8 items-center rounded-lg bg-blue-50 justify-center">
                            <text className="text-xs font-bold text-blue-600">DOC</text>
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
              </view>
            )}
          </>
        )}
        <view className="mt-8">
          <Button
            disabled={data.submission_status == 'submitted' || data.submission_status == 'graded'}
            onPress={() => {
              if (!data.submission_type) {
                console.error('No data to submit');
                return;
              }
              onSubmit({
                files: selectedFiles,
                answerText: answerRef.current?.getValue(),
                type: data.submission_type,
              });
            }}
            className="h-14 w-full"
          >
            Kumpulkan Tugas
          </Button>
        </view>
      </view>
    )
  );
};

export default AssignmentContent;
