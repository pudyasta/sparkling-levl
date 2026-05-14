import type { FC } from '@lynx-js/react';

import { Colors } from '@/constant/style';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

type AlertProps = {
  message: string;
  type: AlertVariant;
  onClose?: () => void;
};

const ALERT_STYLES: Record<AlertVariant, { bg: string; border: string; text: string; label: string }> = {
  success: { bg: Colors.SuccessBg,  border: Colors.Success, text: Colors.SuccessBadgeText, label: 'Berhasil' },
  error:   { bg: Colors.ErrorBg,   border: Colors.Error,   text: Colors.DangerBadgeText,   label: 'Error' },
  warning: { bg: Colors.WarningBg, border: Colors.Warning, text: Colors.WarningBadgeText,  label: 'Perhatian' },
  info:    { bg: Colors.InfoBg,    border: Colors.Info,    text: Colors.InfoBadgeText,      label: 'Info' },
};

export const Alert: FC<AlertProps> = ({ message, type, onClose }) => {
  if (!message) return null;

  const s = ALERT_STYLES[type];

  return (
    <view
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: s.bg,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: s.border,
        borderRadius: '8px',
        padding: '12px 16px',
        width: '100%',
      }}
    >
      <view style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <text
          style={{
            fontFamily: 'inter',
            fontSize: '13px',
            fontWeight: '400',
            color: s.text,
            lineHeight: '18px',
            flex: 1,
          }}
        >
          {message}
        </text>
      </view>

      {onClose && (
        <text
          bindtap={onClose}
          style={{
            fontFamily: 'inter',
            fontSize: '12px',
            fontWeight: '600',
            color: s.text,
            marginLeft: '12px',
            paddingLeft: '8px',
            paddingRight: '8px',
            paddingTop: '2px',
            paddingBottom: '2px',
          }}
        >
          Tutup
        </text>
      )}
    </view>
  );
};
