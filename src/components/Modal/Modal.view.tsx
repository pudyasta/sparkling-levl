import { useEffect, useState } from '@lynx-js/react';
import styles from './style.module.css';
import { sadMascot } from '../../assets/images/mascot';
import Button from '../common/Button';
import Text from '../Text';
import { TextType } from '../Text/types';

export enum ModalTemplate {
  Default = 'default',
  Sad = 'sad',
  Custom = 'custom',
}

type ModalProps = {
  visible: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  template: ModalTemplate;
  title?: string;
  body?: string;
  buttonText?: string;
};
export function Modal({
  visible,
  onClose,
  children,
  template = ModalTemplate.Default,
  title = '',
  body = '',
  buttonText = 'Close',
}: ModalProps) {
  const [mounted, setMounted] = useState(visible);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (visible) {
      setMounted(true);
      setTimeout(() => setActive(true), 0);
    } else {
      setActive(false);
      setMounted(false);
    }
  }, [visible]);
  if (!mounted) return null;

  return (
    <view
      className={styles.overlay}
      bindtap={onClose}
      style={{
        backgroundColor: active ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
      }}
    >
      <view
        className={styles.dialog}
        bindtap={(e: any) => e.stopPropagation?.()}
      >
        {template !== ModalTemplate.Custom && (
          <>
            <view className={styles.modalBody}>
              <image
                src={sadMascot}
                className={styles.mascot}
                mode="aspectFit"
              />
              <Text size={TextType.h3} bold className={styles.title}>
                {title}
              </Text>
              <Text className={styles.body}>{body}</Text>
              <Button variant="outline" color="blue" size="small">
                {buttonText}
              </Button>
            </view>
          </>
        )}

        {template === ModalTemplate.Custom && children}
      </view>
    </view>
  );
}
