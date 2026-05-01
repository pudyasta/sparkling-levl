import { type ReactNode, useState } from '@lynx-js/react';

import { Colors } from '@/constant/style';

import { Loading } from '../Loading/Loading';

// Assuming your palette is exported from here

interface ButtonProps {
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'white';
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  rounded?: boolean;
  isLoading?: boolean;
}

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
}: ButtonProps) => {
  const [animate, setAnimate] = useState(false);

  const theme = {
    primary: Colors.Primary, // #1A73E8
    secondary: Colors.Secondary, // #FFC107
    white: '#FFFFFF',
    neutral: Colors.Neutral, // #202124
    disabled: Colors.Disabled, // #9AA0A6
  };
  const borderColorStyles = {
    primary: Colors.Neutral,
    secondary: Colors.Neutral,
    white: Colors.Neutral,
    neutral: Colors.Accent,
    disabled: Colors.Disabled,
  };

  const handleTap = () => {
    if (disabled) return;
    setAnimate(true);
    onPress?.();
    setTimeout(() => setAnimate(false), 200);
  };

  const getStyles = () => {
    if (disabled) {
      return {
        backgroundColor: '#F5F5F5',
        borderColor: theme.disabled,
        color: theme.disabled,
      };
    }

    const baseColor = theme[color];
    const isWhite = color === 'white';

    if (variant === 'filled') {
      return {
        backgroundColor: baseColor,
        borderColor: borderColorStyles[color],
        color: color === 'primary' ? '#FFFFFF' : '#000000',
      };
    } else {
      return {
        backgroundColor: 'transparent',
        borderColor: baseColor,
        color: isWhite ? '#FFFFFF' : baseColor,
      };
    }
  };

  const { backgroundColor, borderColor, color: textColor } = getStyles();

  return (
    <text
      bindtap={handleTap}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'center',
        fontWeight: '700',
        borderRadius: rounded ? '999px' : '12px',
        borderWidth: '1px',
        borderStyle: 'solid',
        boxSizing: 'border-box',
        // Layout/Sizing
        paddingTop: size === 'small' ? '8px' : size === 'medium' ? '14px' : '20px',
        paddingBottom: size === 'small' ? '8px' : size === 'medium' ? '14px' : '20px',
        // Colors
        backgroundColor,
        borderColor,
        color: textColor,
        // Animation/State
        opacity: animate ? 0.7 : 1,
        transform: animate ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.1s ease-in-out',
      }}
      className={className}
    >
      {isLoading ? <Loading size={32} /> : children}
    </text>
  );
};

export default Button;
