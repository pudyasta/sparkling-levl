import { useEffect, useLynxGlobalEventListener, useState } from '@lynx-js/react';
import pipe from 'sparkling-method';

import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';

// ---------------------------------------------------------------------------
// Hook — use this if you want to bring your own modal UI
// ---------------------------------------------------------------------------

interface UseBackInterceptorOptions {
  onBackPressed: () => void;
  enabled?: boolean;
}

export const useBackInterceptor = ({
  onBackPressed,
  enabled = true,
}: UseBackInterceptorOptions) => {
  useEffect(() => {
    if (!enabled) return;
    pipe.call('navigation.setBackInterceptor', { enabled: true }, () => {});
    return () => {
      pipe.call('navigation.setBackInterceptor', { enabled: false }, () => {});
    };
  }, [enabled]);

  useLynxGlobalEventListener('nativeBackPressed', () => {
    onBackPressed();
  });

  const confirmBack = () => {
    pipe.call('navigation.setBackInterceptor', { enabled: false }, (res) => {
      pipe.call('navigation.goBack', {}, () => {});
    });
  };

  return { confirmBack };
};

// ---------------------------------------------------------------------------
// Component — hook + modal bundled, zero boilerplate at the call site
// ---------------------------------------------------------------------------

interface BackConfirmationProps {
  /** Override the modal title. */
  title?: string;
  /** Override the modal body text. */
  body?: string;
  /** Override the confirm button label. */
  confirmLabel?: string;
  /** Override the cancel button label. */
  cancelLabel?: string;
  /** Set to false to temporarily disable the interceptor. */
  enabled?: boolean;
}

export const BackInterceptor = ({
  title = 'Keluar dari halaman ini?',
  body = 'Kemajuan kamu akan hilang jika kamu keluar.',
  confirmLabel = 'Keluar',
  cancelLabel = 'Tetap di sini',
  enabled = true,
}: BackConfirmationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { confirmBack } = useBackInterceptor({
    onBackPressed: () => setIsOpen(true),
    enabled,
  });

  const handleConfirm = () => {
    setIsOpen(false);
    confirmBack();
  };

  return (
    <Modal template={ModalTemplate.Custom} visible={isOpen} onClose={() => setIsOpen(false)}>
      <view className="flex-col gap-4 flex">
        <Text size={TextType.h2} fontWeight="600" className="text-center">
          {title}
        </Text>
        <Text className="text-[#5f6368] text-center">{body}</Text>
        <view className="flex-col gap-3 flex">
          <Button size="small" variant="filled" color="primary" onPress={handleConfirm}>
            {confirmLabel}
          </Button>
          <Button size="small" variant="outlined" color="primary" onPress={() => setIsOpen(false)}>
            {cancelLabel}
          </Button>
        </view>
      </view>
    </Modal>
  );
};
