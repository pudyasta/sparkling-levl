import { useEffect, useState } from '@lynx-js/react';
import { chooseMedia, downloadFile } from 'sparkling-media';

import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import type { AssignmentStudentResponse } from './repository/type/assignment';
import type { LessonData } from './repository/type/lessons';
import type { QuizStudentResponse } from './repository/type/quiz';
import { useGetLessons } from './usecase/useGetLessons';
import { useMarkAsDone } from './usecase/useMarkAsDone';

interface MediaFile {
  base64Data?: string;
  size?: number;
  tempFilePath?: string;
  mediaType?: string;
  mimeType?: string;
  tempFileAbsolutePath?: string;
}

const AssignmentContent = ({ data }: { data: AssignmentStudentResponse }) => {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const isGraded = data.submission_status === 'graded';
  const choose = () => {
    chooseMedia(
      {
        mediaTypes: ['file'],
        sourceType: 'file',
        maxCount: 3,
      },
      (res) => {
        if (res.code === 0) {
          console.log(JSON.stringify(res.data, null, 2));
          setSelectedFiles(res.data.tempFiles);
          console.log(selectedFiles);
        }
      }
    );
  };

  return (
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
      {data.is_completed && (
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
              {/* Dikumpulkan pada {new Date(data.submitted_at).toLocaleDateString()} */}
            </Text>
          </view>
          <view className="items-end">
            <Text
              size={TextType.h2}
              fontWeight={'bold'}
              className={isGraded ? 'text-green-700' : 'text-blue-700'}
            >
              {data.score || '0'}
            </Text>
            <Text size={TextType.b2} className={isGraded ? 'text-green-600' : 'text-blue-600'}>
              Skor Akhir
            </Text>
          </view>
        </view>
      )}

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
      <view className="mb-6 grid-cols-2 gap-3 grid">
        <view className="rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-3">
          <Text size={TextType.b2} color={Colors.Primary}>
            Format File
          </Text>
          <Text size={TextType.b2} fontWeight={'bold'} className="mt-1">
            PDF, DOC, ZIP, JPG
          </Text>
        </view>
        <view className="rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-3">
          <Text size={TextType.b2} color={Colors.Primary}>
            Ukuran Maksimal
          </Text>
          <Text size={TextType.b2} fontWeight={'bold'} className="mt-1">
            {data.max_file_size} MB
          </Text>
        </view>
      </view>

      {/* 5. Upload Area */}
      {data.is_completed && (
        <view className="flex-col flex">
          <Text size={TextType.b2} color={Colors.Primary} className="mb-2 font-bold">
            Unggah Jawaban:
          </Text>
          <view
            className="items-center rounded-2xl border-2 border-dashed border-[#dadce0] bg-[#f8f9fa] p-6 justify-center"
            bindtap={choose}
          >
            {selectedFiles.length > 0 ? (
              <view className="w-full">
                {selectedFiles.map((file: any) => (
                  <view
                    key={file.tempFilePath}
                    className="mt-2 flex-row items-center rounded-xl border border-[#e8eaed] bg-white p-3 shadow-sm"
                  >
                    <view className="mr-3 h-8 w-8 items-center rounded-lg bg-blue-50 justify-center">
                      <text className="text-xs font-bold text-blue-600">DOC</text>
                    </view>
                    <Text size={TextType.b2} className="flex-1">
                      {file.tempFilePath?.split('/').pop()}
                    </Text>
                    <text className="ml-2 font-bold text-red-500">✕</text>
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
                <Text size={TextType.b2} color={Colors.Primary} className="mt-1 text-center">
                  Tarik file atau klik untuk mencari dokumen
                </Text>
              </view>
            )}
          </view>
        </view>
      )}
    </view>
  );
};

const QuizContent = ({ data }: { data: QuizStudentResponse }) => {
  return (
    <view className="flex-col pb-[40px] pt-[60px] flex">
      {/* Header Section */}
      <view className="mb-6">
        <view className="mb-2 flex-row items-center flex">
          <view className="mr-2 rounded-md bg-blue-100 px-2 py-1">
            <text className="uppercase text-[10px] font-bold tracking-wider text-blue-600">
              Quiz
            </text>
          </view>
          <Text size={TextType.b2} color={Colors.Primary}>
            Quiz • {data.questions_count} Pertanyaan
          </Text>
        </view>
        <Text size={TextType.h2} fontWeight={'bold'} className="leading-tight">
          {data.title}
        </Text>
      </view>

      {/* Description Section */}
      <view className="mb-6">
        <Text size={TextType.b2} color={Colors.Primary} className="mb-1">
          Deskripsi:
        </Text>
        <Text size={TextType.b1} className="leading-relaxed">
          {data.description}
        </Text>
      </view>

      {/* Info Cards Grid */}
      <view className="mb-8 grid-cols-2 gap-4 grid">
        <view className="flex-col items-center rounded-2xl border border-[#e8eaed] bg-[#f8f9fa] p-4 flex">
          <Text size={TextType.b2} color={Colors.Primary}>
            Waktu
          </Text>
          <Text size={TextType.h2} fontWeight={'bold'} className="mt-1">
            {data.time_limit_minutes} Menit
          </Text>
        </view>
        <view className="flex-col items-center rounded-2xl border border-[#e8eaed] bg-[#f8f9fa] p-4 flex">
          <Text size={TextType.b2} color={Colors.Primary}>
            Passing Grade
          </Text>
          <Text size={TextType.h2} fontWeight={'bold'} className="mt-1 text-green-600">
            {data.passing_grade}%
          </Text>
        </view>
      </view>

      {/* Reward Info */}
      <view className="mb-8 flex-row items-center rounded-2xl border border-yellow-100 bg-yellow-50 p-4 flex">
        <view className="mr-3 h-10 w-10 items-center rounded-full bg-yellow-400 flex justify-center">
          <text className="font-bold text-white">★</text>
        </view>
        <view className="flex-col flex">
          <Text size={TextType.b2} fontWeight={'bold'} className="text-yellow-800">
            Hadiah XP
          </Text>
          <Text size={TextType.b2} className="text-yellow-700">
            Dapatkan {data.xp_reward} XP + {data.xp_perfect_bonus} Bonus Sempurna
          </Text>
        </view>
      </view>

      {/* Start Button */}
      <Button className="h-14 w-full">Mulai Kerjakan Quiz</Button>

      {/* Attempts Info */}
      <view className="mt-4 items-center">
        <Text size={TextType.b2} color={Colors.Primary}>
          {data.attempts_used === 0
            ? 'Anda belum pernah mencoba quiz ini.'
            : `Percobaan digunakan: ${data.attempts_used}`}
        </Text>
      </view>
    </view>
  );
};

const LessonContent = ({
  data,
  stripHtml,
}: {
  data: LessonData;
  stripHtml: (html: string) => string;
}) => {
  return (
    <view className="flex-col pb-[50px] pt-[60px] flex">
      {/* Header */}
      <view className="mb-6">
        <view className="mb-2 flex-row items-center flex">
          <view className="mr-2 rounded-md bg-green-100 px-2 py-1">
            <text className="uppercase text-[10px] font-bold tracking-wider text-green-600">
              Materi
            </text>
          </view>
          <Text size={TextType.b2} color={Colors.Primary}>
            Step {data.order}
          </Text>
        </view>
        <Text size={TextType.h2} fontWeight={'bold'} className="leading-tight">
          {data.title}
        </Text>
      </view>

      {/* Blocks Mapping */}
      {data.blocks?.map((block: any) => (
        <view key={block.id} className="mb-5">
          {/* TEXT BLOCK */}
          {block.block_type === 'text' && (
            <Text size={TextType.b1} className="leading-6">
              {block.content}
            </Text>
          )}

          {/* VIDEO BLOCK */}
          {block.block_type === 'video' && block.media && (
            <view className="rounded-xl bg-black overflow-hidden">
              {/* <video src={block.media.url} className="h-[210px] w-full" controls={true} /> */}
              <view className="bg-white p-3">
                <Text size={TextType.b2} color={Colors.Secondary}>
                  {stripHtml(block.content)}
                </Text>
              </view>
            </view>
          )}

          {/* IMAGE BLOCK */}
          {block.block_type === 'image' && block.media && (
            <view className="rounded-xl border border-[#f1f3f4] overflow-hidden">
              <image src={block.media.url} className="h-[200px] w-full" mode="aspectFill" />
              <Text
                size={TextType.b2}
                className="bg-[#f9f9f9] p-3 text-xs text-[#5f6368] text-center"
              >
                {stripHtml(block.content) || block.media.file_name}
              </Text>
            </view>
          )}

          {/* FILE BLOCK */}
          {block.block_type === 'file' && block.media && (
            <view className="flex-row items-center rounded-xl border border-[#d2e3fc] bg-white p-4 flex justify-between">
              <view className="flex-1">
                <text className="mb-1 text-sm font-bold text-[#1a73e8]">
                  {block.media.file_name}
                </text>
                <text className="text-xs text-[#5f6368]">
                  {(block.media.size / 1024).toFixed(1)} KB • PDF
                </text>
              </view>
              <view
                className="rounded-lg bg-[#1a73e8] px-4 py-2 active:opacity-70"
                bindtap={() => {}}
              >
                <text className="text-xs font-bold text-white">Download</text>
              </view>
            </view>
          )}
        </view>
      ))}

      {/* MARK AS DONE BUTTON (at the end of content) */}
      <view className="mt-8">
        <Button
          // onPress={onMarkAsDone}
          // disabled={data.is_completed || isMarkingLoading}
          className="h-14 w-full"
        >
          {/* {isButtonLoading ? (
            <Loading size={20} />
          ) : data.is_completed ? (
            '✓ Selesai'
          ) : (
            'Tandai Sudah Selesai'
          )} */}
          Selesai
        </Button>
      </view>
    </view>
  );
};

const LessonPage = () => {
  const { routerParams } = useNativeBridge();
  const { execute } = useMarkAsDone();
  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');
  const [currentParams, setCurrentParams] = useState({
    lesson_slug: routerParams?.lesson_slug || '',
    unit_slug: routerParams?.unit_slug || '',
    course_slug: routerParams?.course_slug || '',
    assignment_id: routerParams?.assignment_id || 0,
    type: routerParams?.type || '',
  });

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  let allLessons = routerParams?.all_lessons || [];

  const {
    data: lessons,
    isLoading: isLoadingApi,
    refetch,
  } = useGetLessons({
    course_slug: currentParams.course_slug,
    unit_slug: currentParams.unit_slug,
    lesson_slug: currentParams.lesson_slug,
    assignment_id: currentParams.assignment_id,
    type: currentParams.type,
    quiz_id: currentParams.assignment_id,
  });

  const handlePageChange = (index: number) => {
    setIsLoading(true);

    const target = allLessons[index];
    if (!target || target.is_locked) return;

    setCurrentParams({
      ...currentParams,
      lesson_slug: target.slug,
      assignment_id: target.id,
      type: target.type,
    });

    setIsSheetOpen(false);
  };

  useEffect(() => {
    refetch().finally(() => {
      setIsLoading(false);
    });
  }, [currentParams, isLoading]);

  useEffect(() => {
    const complete = allLessons.filter((l: any) => l.is_completed).length || 0;
    setCompletedLessons(complete);
    setProgressPercentage(allLessons.length > 0 ? (complete / allLessons.length) * 100 : 0);
  }, []);

  useEffect(() => {
    console.log('ALLLessons', JSON.stringify(lessons, null, 2));
  }, [lessons]);

  const handleBottomSheetHeight = (length: number) => {
    if (length <= 2) return '25vh';
    if (length <= 4) return '40vh';
    return '45vh';
  };

  const renderContent = () => {
    if (isLoading)
      return (
        <view className="h-[100vh] items-center flex justify-center">
          <Loading size={32} />
        </view>
      );

    switch (currentParams.type) {
      case 'assignment':
        return <AssignmentContent data={lessons?.data as AssignmentStudentResponse} />;
      case 'quiz':
        return <QuizContent data={lessons?.data as QuizStudentResponse} />;
      default:
        return <LessonContent data={lessons?.data as LessonData} stripHtml={stripHtml} />;
    }
  };

  const handleMarkAsDoneLessons = () => {
    setIsButtonLoading(true);
    execute(currentParams.lesson_slug, {
      onSuccess: (data) => {
        setIsButtonLoading(false);
        refetch();
        allLessons[lessons?.data?.order || 0 - 1].is_completed = true;
        if (lessons?.data?.order && lessons?.data?.order < allLessons.length) {
          allLessons[lessons?.data?.order || 0].is_locked = false;
        }
      },
      onError: (error) => {
        setIsButtonLoading(false);
      },
    });
  };

  return (
    !isLoadingApi && (
      <view className="h-screen w-full relative">
        <scroll-view className="h-full w-full p-5" scroll-y>
          {renderContent()}
        </scroll-view>

        {/* Footer Navigation */}
        {/* <view className="w-full absolute bottom-0">
          {isSheetOpen && <view className="fixed inset-0" bindtap={() => setIsSheetOpen(false)} />}
          <view className="z-[110] border-t border-[#f1f3f4] bg-white px-5 pb-8 pt-4">
            <view className="grid-cols-[1fr_3fr_1fr] items-center gap-5 grid">
              <Button
                color="white"
                rounded={true}
                className="text-2xl"
                disabled={lessons!.data.order <= 1}
                onPress={() => handlePageChange(lessons!.data.order - 2)}
              >
                ‹
              </Button>
              <Button
                disabled={lessons?.data?.is_completed || isButtonLoading}
                onPress={handleMarkAsDoneLessons}
              >
                {isButtonLoading ? <Loading size={20} /> : 'Selesai'}
              </Button>
              <Button
                color="white"
                rounded={true}
                className="text-2xl"
                disabled={
                  lessons!.data.order >= allLessons.length ||
                  allLessons[lessons!.data.order].is_locked
                }
                onPress={() => handlePageChange(lessons!.data.order)}
              >
                ›
              </Button>
            </view>
          </view>
        </view> */}

        {/* Progress Trigger */}
        <view
          className="z-[110] w-full border-b border-[#f1f3f4] bg-white p-4 px-5 absolute top-0"
          bindtap={() => setIsSheetOpen(!isSheetOpen)}
        >
          <view className="mb-2 flex-row flex justify-between">
            <Text size={TextType.b1}>
              Course Progress {completedLessons}/{routerParams?.all_lessons.length || 0}
            </Text>
            <Text>{isSheetOpen ? '▼' : '▲'}</Text>
          </view>
          <view className="h-1.5 w-full rounded-full bg-[#f1f3f4]">
            <view
              className="h-full rounded-full"
              style={{ width: `${progressPercentage}%`, backgroundColor: Colors.Success }}
            />
          </view>
        </view>

        {/* Bottom Sheet List */}
        <view
          className={`duration-350 z-[105] w-full rounded-b-3xl bg-white p-4 absolute top-0 shadow-2xl transition-transform ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isSheetOpen ? 'translate-y-[60px]' : '-translate-y-full'}`}
          style={{ height: handleBottomSheetHeight(routerParams?.all_lessons.length || 0) }}
        >
          <scroll-view className="h-full w-full px-1" scroll-y>
            {routerParams?.all_lessons.map((item: any, i: number) => {
              const isActive = item.id === currentParams.assignment_id;
              return (
                <view
                  key={item.id}
                  bindtap={() => handlePageChange(i)}
                  className={`mb-2 flex-row items-center rounded-xl border p-4 flex transition-all duration-200 ${isActive ? 'border-[#d1e3ff] bg-[#f0f7ff]' : 'border-transparent'} ${item.is_locked ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <view className="mr-4">
                    {item.is_completed ? (
                      <view className="h-6 w-6 items-center rounded-full bg-[#34a853] flex justify-center">
                        <text className="text-xs font-extrabold text-white">✓</text>
                      </view>
                    ) : (
                      <view
                        className={`h-[22px] w-[22px] rounded-full border-2 bg-white ${isActive ? 'border-[#1a73e8]' : 'border-[#dadce0]'}`}
                      />
                    )}
                  </view>
                  <text
                    className={`text-base font-medium ${isActive ? 'font-bold text-[#1a73e8]' : 'text-[#3c4043]'}`}
                  >
                    {item.title}
                  </text>
                </view>
              );
            })}
          </scroll-view>
        </view>
      </view>
    )
  );
};

export default LessonPage;
