import { Colors } from '../../constant/style';
import { useState, type ReactNode } from '@lynx-js/react';

interface ButtonProps {
  children: ReactNode;
  color?: 'blue' | 'yellow' | 'white';
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'outline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const colorStyles: Record<NonNullable<ButtonProps['color']>, string> = {
  blue: `${Colors.Primary}`,
  yellow: `${Colors.Secondary}`,
  white: `${Colors.Accent}`,
};

const borderColorStyles: Record<NonNullable<ButtonProps['color']>, string> = {
  blue: `border-primary`,
  yellow: `border-secondary`,
  white: 'border-black',
};

const textColorStyles: Record<NonNullable<ButtonProps['color']>, string> = {
  blue: `text-primary`,
  yellow: `text-black`,
  white: 'text-black',
};

const Button: React.FC<ButtonProps> = ({
  children,
  color = 'blue',
  variant = 'solid',
  onPress,
  disabled = false,
  size = 'medium',
  className = '',
}) => {
  const [animate, setAnimate] = useState(false);

  const handleTap = () => {
    if (disabled) return;
    setAnimate(true);
    onPress?.();

    setTimeout(() => setAnimate(false), 500);
  };

  return (
    <text
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'center',
        fontWeight: '700',
        borderRadius: '12px',
        borderWidth: '1px',
        borderStyle: 'solid',
        transition: 'all 500ms ease-out',
        boxSizing: 'border-box',

        // Dynamic Padding (Size)
        paddingTop: size === 'small' ? '12px' : size === 'medium' ? '16px' : '24px',
        paddingBottom: size === 'small' ? '12px' : size === 'medium' ? '16px' : '24px',

        // Disabled State vs Active State
        ...(disabled
          ? {
              cursor: 'not-allowed',
              backgroundColor: 'rgba(156, 163, 175, 0.2)',
              borderColor: 'rgba(156, 163, 175, 0.2)',
              color: 'rgba(55, 65, 81, 0.5)',
            }
          : variant === 'solid'
            ? {
                backgroundColor: colorStyles[color], // Must be a Hex/RGB value
                color: color === 'blue' ? '#ffffff' : '#000000',
                borderColor: 'transparent',
              }
            : {
                backgroundColor: 'transparent',
                borderColor: borderColorStyles[color], // Must be a Hex/RGB value
                color: textColorStyles[color], // Must be a Hex/RGB value
              }),
      }}
      className={animate ? 'animate-press-bounce' : ''}
      bindtap={handleTap}
    >
      {children}
    </text>
  );
};

export default Button;
