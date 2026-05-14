import { useState } from '@lynx-js/react';

import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConfirmationOptions {
  title?: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface UseConfirmationReturn {
  /** Wrap any action with this. It will pause and wait for user confirmation first. */
  confirm: (action: () => void, options?: ConfirmationOptions) => void;
  /** Render this somewhere in your component tree. */
  ConfirmationModal: () => JSX.Element;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useConfirmation = (defaults?: ConfirmationOptions): UseConfirmationReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [options, setOptions] = useState<ConfirmationOptions>({
    title: defaults?.title ?? 'Apakah kamu yakin?',
    body: defaults?.body ?? 'Tindakan ini tidak dapat dibatalkan.',
    confirmLabel: defaults?.confirmLabel ?? 'Ya, lanjutkan',
    cancelLabel: defaults?.cancelLabel ?? 'Batal',
  });

  const confirm = (action: () => void, overrides?: ConfirmationOptions) => {
    setPendingAction(() => action);
    setOptions({
      title: overrides?.title ?? defaults?.title ?? 'Apakah kamu yakin?',
      body: overrides?.body ?? defaults?.body ?? 'Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: overrides?.confirmLabel ?? defaults?.confirmLabel ?? 'Ya, lanjutkan',
      cancelLabel: overrides?.cancelLabel ?? defaults?.cancelLabel ?? 'Batal',
    });
    setIsOpen(true);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    pendingAction?.();
    setPendingAction(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setPendingAction(null);
  };

  const ConfirmationModal = () => (
    <Modal template={ModalTemplate.Custom} visible={isOpen} onClose={handleCancel}>
      <view className="flex-col gap-4 flex">
        <Text size={TextType.h2} fontWeight="600" className="text-center">
          {options.title}
        </Text>
        <Text className="text-[#5f6368] text-center">{options.body}</Text>
        <view className="flex-col gap-3 flex">
          <Button size="small" variant="filled" color="primary" onPress={handleConfirm}>
            {options.confirmLabel}
          </Button>
          <Button size="small" variant="outlined" color="primary" onPress={handleCancel}>
            {options.cancelLabel}
          </Button>
        </view>
      </view>
    </Modal>
  );

  return { confirm, ConfirmationModal };
};
