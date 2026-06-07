import { useCallback, useEffect, useRef, useState } from '@lynx-js/react';
import pipe from 'sparkling-method';

import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { Colors } from '@/constant/style';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface FileCardProps {
  url: string;
  filename?: string;
  filesize?: number;
  /** Called with the local path once download succeeds — parent owns the toast */
  onDownloadSuccess?: (localPath: string) => void;
}

type DownloadState = 'idle' | 'downloading' | 'done' | 'error';

// ─── Toast — exported so LessonContent can render it at screen level ──────────

export function DownloadToast({ visible, onLihat }: { visible: boolean; onLihat: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setMounted(true), 16);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [visible]);

  return (
    <view
      className={`w-full px-4 absolute bottom-20 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      <view className="elevation-6 flex-row items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 flex shadow-lg">
        {/* Icon badge */}
        <view className="h-10 w-10 shrink-0 items-center rounded-xl bg-indigo-50 justify-center">
          <text className="text-xs font-bold text-indigo-600">XLSX</text>
        </view>

        {/* Text */}
        <view className="flex-1">
          <Text size={TextType.b2}>Berkas berhasil diunduh</Text>
          <Text size={TextType.b3}>Tap Lihat untuk membuka</Text>
        </view>

        {/* Divider */}
        <view className="h-8 w-px bg-gray-100" />

        {/* Lihat */}
        <view bindtap={onLihat} className="items-center px-1 justify-center">
          <Text size={TextType.b1} fontWeight="bold" color={Colors.Primary}>
            Lihat
          </Text>
        </view>
      </view>
    </view>
  );
}

// ─── FileCard ──────────────────────────────────────────────────────────────────

export function FileCard({ url, filename, filesize, onDownloadSuccess }: FileCardProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');

  const displayName = filename ?? url.split('?')[0].split('/').pop() ?? 'File';

  const handleDownload = useCallback(() => {
    if (downloadState === 'downloading') return;
    setDownloadState('downloading');

    pipe.call('file.download', { url, filename: displayName }, (res: any) => {
      if (res.data.success && res.data.localPath) {
        setDownloadState('done');
        onDownloadSuccess?.(res.data.localPath);
      } else {
        setDownloadState('error');
        setTimeout(() => setDownloadState('idle'), 2000);
      }
    });
  }, [url, displayName, downloadState, onDownloadSuccess]);

  const btnLabel = {
    idle: 'Download',
    downloading: '...',
    done: 'Download',
    error: 'Retry',
  }[downloadState];

  return (
    <view className="flex-row items-center rounded-xl border border-[#d2e3fc] bg-white p-4 flex justify-between">
      <view className="flex-1">
        <text className="mb-1 text-sm font-bold text-[#1a73e8]">{displayName}</text>
        <text className="text-xs text-[#5f6368]">{((filesize ?? 0) / 1024).toFixed(1)} KB</text>
      </view>
      <view
        className="rounded-lg bg-[#1a73e8] px-4 py-2 active:opacity-70"
        bindtap={handleDownload}
      >
        <text className="text-xs font-bold text-white">{btnLabel}</text>
      </view>
    </view>
  );
}
