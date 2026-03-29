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
  blue: `bg-primary`,
  yellow: `bg-secondary`,
  white: 'bg-white',
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
      className={`
        w-full text-center font-semibold rounded-xl ${size === 'small' ? 'py-3' : size === 'medium' ? 'py-4' : 'py-6'} font-bold transition-all duration-500 ease-out border-[1px] 
        ${animate ? 'animate-press-bounce' : ''}  
        ${
          disabled
            ? 'cursor-not-allowed !bg-gray-400/20 border-gray-400/20 text-gray-700/50 '
            : variant === 'solid'
              ? color == 'blue'
                ? ' text-white border-neutral ' + colorStyles[color]
                : ' text-black border-neutral ' + colorStyles[color]
              : ` bg-transparent  ${borderColorStyles[color]} ${textColorStyles[color]}`
        } ${className}`}
      bindtap={handleTap}
    >
      {children}
    </text>
  );
};

export default Button;
