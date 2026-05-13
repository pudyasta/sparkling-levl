import type { FC, ReactNode } from '@lynx-js/react';

import { Colors } from '@/constant/style';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'primary';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Colors.SuccessBadgeBg, text: Colors.SuccessBadgeText },
  warning: { bg: Colors.WarningBadgeBg, text: Colors.WarningBadgeText },
  danger:  { bg: Colors.DangerBadgeBg,  text: Colors.DangerBadgeText },
  info:    { bg: Colors.InfoBadgeBg,    text: Colors.InfoBadgeText },
  neutral: { bg: Colors.NeutralBadgeBg, text: Colors.NeutralBadgeText },
  primary: { bg: Colors.Primary,        text: Colors.TextInverse },
};

const Badge: FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const { bg, text } = VARIANT_STYLES[variant];

  return (
    <view
      className={className}
      style={{
        display: 'inline-flex',
        alignSelf: 'flex-start',
        paddingTop: '3px',
        paddingBottom: '3px',
        paddingLeft: '8px',
        paddingRight: '8px',
        borderRadius: '9999px',
        backgroundColor: bg,
      }}
    >
      <text
        style={{
          fontFamily: 'inter',
          fontSize: '11px',
          fontWeight: '600',
          lineHeight: '16px',
          color: text,
        }}
      >
        {children}
      </text>
    </view>
  );
};

export default Badge;
