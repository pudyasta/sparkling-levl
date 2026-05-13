import { type ReactNode, useState } from '@lynx-js/react';

import { Colors } from '@/constant/style';

import { Loading } from '../Loading/Loading';

interface ButtonProps {
  children: ReactNode;
  /** Visual variant — use 'danger' for destructive actions, 'ghost' for tertiary */
  color?: 'primary' | 'secondary' | 'white' | 'danger';
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  rounded?: boolean;
  isLoading?: boolean;
  style?: Record<string, string | number>;
}

const PADDING: Record<string, { paddingTop: string; paddingBottom: string; paddingLeft: string; paddingRight: string; fontSize: string }> = {
  sm:     { paddingTop: '6px',  paddingBottom: '6px',  paddingLeft: '12px', paddingRight: '12px', fontSize: '12px' },
  small:  { paddingTop: '6px',  paddingBottom: '6px',  paddingLeft: '12px', paddingRight: '12px', fontSize: '12px' },
  md:     { paddingTop: '10px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '16px', fontSize: '14px' },
  medium: { paddingTop: '10px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '16px', fontSize: '14px' },
  lg:     { paddingTop: '14px', paddingBottom: '14px', paddingLeft: '24px', paddingRight: '24px', fontSize: '15px' },
  large:  { paddingTop: '14px', paddingBottom: '14px', paddingLeft: '24px', paddingRight: '24px', fontSize: '15px' },
};

const Button = ({
  children,
  color = 'primary',
  variant = 'filled',
  onPress,
  disabled = false,
  size = 'medium',
  className = '',
  rounded = false,
  isLoading = false,
  style: styleProp = {},
}: ButtonProps) => {
  const [pressed, setPressed] = useState(false);

  const handleTap = () => {
    if (disabled || isLoading) return;
    setPressed(true);
    onPress?.();
    setTimeout(() => setPressed(false), 150);
  };

  const getColorStyles = () => {
    if (disabled) {
      return {
        backgroundColor: Colors.N200,
        borderColor: Colors.N200,
        color: Colors.TextDisabled,
      };
    }

    if (variant === 'ghost') {
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        color: Colors.Primary,
      };
    }

    if (variant === 'outlined') {
      const borderColor =
        color === 'danger' ? Colors.Error
        : color === 'secondary' ? Colors.Secondary
        : Colors.Primary;
      return {
        backgroundColor: 'transparent',
        borderColor,
        color: borderColor,
      };
    }

    // filled
    switch (color) {
      case 'danger':
        return { backgroundColor: Colors.Error, borderColor: Colors.Error, color: Colors.TextInverse };
      case 'secondary':
        return { backgroundColor: Colors.Secondary, borderColor: Colors.Secondary, color: Colors.N900 };
      case 'white':
        return { backgroundColor: '#FFFFFF', borderColor: Colors.N200, color: Colors.Primary };
      default:
        return { backgroundColor: Colors.Primary, borderColor: Colors.Primary, color: Colors.TextInverse };
    }
  };

  const { backgroundColor, borderColor, color: textColor } = getColorStyles();
  const pad = PADDING[size] || PADDING.medium;

  return (
    <text
      bindtap={handleTap}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'center',
        fontFamily: 'inter',
        fontWeight: '600',
        borderRadius: rounded ? '9999px' : '8px',
        borderWidth: '1px',
        borderStyle: 'solid',
        boxSizing: 'border-box',
        ...pad,
        backgroundColor,
        borderColor,
        color: textColor,
        opacity: (pressed || isLoading) ? 0.75 : 1,
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.1s ease-in-out',
        minHeight: '44px',
        ...styleProp,
      }}
      className={className}
    >
      {isLoading ? <Loading size={24} /> : children}
    </text>
  );
};

export default Button;
