import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import NativeVideoPlayer from '@/components/common/VideoPlayer';
import { Colors } from '@/constant/style';

import type { LessonBlock, LessonData } from '../../repository/type/lessons';

const LessonContent = ({
  data,
  handleMarkAsDoneLessons,
  loading,
}: {
  data: LessonData;
  handleMarkAsDoneLessons: () => void;
  loading: boolean;
}) => {
  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

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
      {data.blocks?.map((block: LessonBlock) => (
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
              <NativeVideoPlayer src={block.media.url} className="h-[210px] w-full" />
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
          onPress={handleMarkAsDoneLessons}
          disabled={data.is_completed || loading}
          className="h-14 w-full"
        >
          {loading ? (
            <Loading size={20} />
          ) : data.is_completed ? (
            '✓ Selesai'
          ) : (
            'Tandai Sudah Selesai'
          )}
          {/* Selesai */}
        </Button>
      </view>
    </view>
  );
};

export default LessonContent;
