import { useCallback, useEffect, useRef, useState } from '@lynx-js/react';
import pipe from 'sparkling-method';

import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import NativeVideoPlayer from '@/components/common/VideoPlayer';
import { Colors } from '@/constant/style';
import { htmlToLynx } from '@/lib/helper/htmlToLynx';

import type { LessonBlock, LessonData } from '../../repository/type/lessons';
import { DownloadToast, FileCard } from '../DownloadFile/DownloadFile';

const LessonContent = ({
  data,
  handleMarkAsDoneLessons,
  loading,
}: {
  data: LessonData;
  handleMarkAsDoneLessons: () => void;
  loading: boolean;
}) => {
  // ── Toast state lives here so it's positioned relative to the screen ────────
  const [toastVisible, setToastVisible] = useState(false);
  const [downloadedPath, setDownloadedPath] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss after 4s
  useEffect(() => {
    if (toastVisible) {
      toastTimer.current = setTimeout(() => setToastVisible(false), 4000);
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [toastVisible]);

  const handleDownloadSuccess = useCallback((localPath: string) => {
    console.log(localPath);
    setDownloadedPath(localPath);
    setToastVisible(true);
  }, []);

  const handleLihat = useCallback(() => {
    if (!downloadedPath) return;
    setToastVisible(false);

    pipe.call('file.open', { localPath: downloadedPath }, (res: any) => {
      if (!res.data.success) {
        console.warn('file.open failed:', res.data.error);
      }
    });
  }, [downloadedPath]);

  return (
    // position: relative so the absolute toast is anchored to this screen container
    <view className="mt-5 flex-1 relative">
      <view className="flex-col px-5 pb-[50px] pt-[60px] flex">
        {/* Header */}
        <view className="mb-6">
          <view className="mb-2 flex-row items-center flex">
            <view className="mr-2 rounded-md bg-green-100 px-2 py-1">
              <text className="uppercase text-[10px] font-bold tracking-wider text-green-600">
                Materi
              </text>
            </view>
            <Text size={TextType.b2} color={Colors.Primary}>
              Materi Ke-{data.order}
            </Text>
          </view>
          <Text size={TextType.h1} fontWeight="bold" className="leading-tight">
            {data.title}
          </Text>
        </view>

        {/* Blocks */}
        {data.blocks?.map((block: LessonBlock) => (
          <view key={block.id} className="mb-5">
            {block.block_type === 'text' && <>{htmlToLynx(block.content)}</>}

            {block.block_type === 'video' && block.media && (
              <view className="rounded-xl bg-black overflow-hidden">
                <NativeVideoPlayer src={block.media.url} className="h-[210px] w-full" />
                <view className="bg-white p-3">{htmlToLynx(block.content)}</view>
              </view>
            )}

            {block.block_type === 'image' && block.media && (
              <view className="rounded-xl border border-[#f1f3f4] overflow-hidden">
                <image src={block.media.url} className="h-[200px] w-full" mode="aspectFill" />
                <Text
                  size={TextType.b2}
                  className="bg-[#f9f9f9] p-3 text-xs text-[#5f6368] text-center"
                >
                  {htmlToLynx(block.content) || block.media.file_name}
                </Text>
              </view>
            )}

            {/* FileCard no longer owns the toast — just calls back on success */}
            {block.block_type === 'file' && block.media && (
              <FileCard
                filename={block.media.file_name}
                filesize={block.media.size}
                url={block.media.url}
                onDownloadSuccess={handleDownloadSuccess}
              />
            )}
          </view>
        ))}

        {/* Mark as done */}
        <view className="mt-8">
          <Button
            onPress={handleMarkAsDoneLessons}
            disabled={data.is_completed}
            className="h-14 w-full"
            isLoading={loading}
          >
            {data.is_completed ? '✓ Selesai' : 'Tandai Sudah Selesai'}
          </Button>
        </view>
      </view>

      {/* Toast — absolute inside this relative container = screen-level */}
      <DownloadToast visible={toastVisible} onLihat={handleLihat} />
    </view>
  );
};

export default LessonContent;
